"use strict";

const storageKey = "harvey.workspace.v1";
const $ = (id) => document.getElementById(id);
const weekdays = ["日", "一", "二", "三", "四", "五", "六"];
const displayWeek = [1, 2, 3, 4, 5, 6, 0];
const labels = { task: "待办", course: "课程", countdown: "倒计时", reminder: "提醒", note: "笔记" };
const html = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]
));
const pad = (number) => String(number).padStart(2, "0");
const localDate = (date) => [String(date.getFullYear()).padStart(4, "0"), pad(date.getMonth() + 1), pad(date.getDate())].join("-");
const localTime = (date) => pad(date.getHours()) + ":" + pad(date.getMinutes());
const shortDate = new Intl.DateTimeFormat("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const datedYear = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
const heroDate = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "long", day: "numeric", weekday: "long" });
const moment = (time) => new Date(time).getTime();
const when = (time) => (time.slice(0, 4) === today.slice(0, 4) ? shortDate : datedYear).format(new Date(time));
const isDate = (value) => typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(moment(value + "T12:00")) && localDate(new Date(value + "T12:00")) === value;
const isTime = (value) => typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
const isDateTime = (value) => typeof value === "string" && value.length === 16 &&
  isDate(value.slice(0, 10)) && value[10] === "T" && isTime(value.slice(11)) && Number.isFinite(moment(value));
const isText = (value, max) => typeof value === "string" && value.length <= max;
const taskDay = () => $("task-day").value;
const dialog = $("workspace-dialog");
const content = $("dialog-content");
const viewLinks = new Map(Array.from(document.querySelectorAll("[data-view]"), (link) => [link.dataset.view, link]));
const widgets = Array.from(document.querySelectorAll(".widget"));
const studyFrames = new Map();
const moduleHomeMessage = "harvey:module-return-home";
let currentView;
let today = localDate(new Date());
let viewedWeekday = new Date().getDay();
let storageBroken = false;
let noticeTimer;

function validEntry(entry) {
  if (!entry || !Object.hasOwn(labels, entry.type) || typeof entry.id !== "string" || !/^[a-z0-9-]{1,80}$/i.test(entry.id) ||
      !isText(entry.title, 90) || !entry.title.trim()) return false;
  switch (entry.type) {
    case "task":
      return isDate(entry.day) && typeof entry.repeat === "boolean" && typeof entry.important === "boolean" &&
        Array.isArray(entry.checked) && entry.checked.every(isDate);
    case "course":
      return displayWeek.includes(entry.weekday) && isTime(entry.start) && isTime(entry.end) &&
        entry.start < entry.end && isText(entry.place, 90);
    case "countdown":
      return isDateTime(entry.at);
    case "reminder":
      return isDateTime(entry.at) && typeof entry.done === "boolean";
    case "note":
      return isText(entry.body, 1500);
  }
}

function parseBackup(value) {
  const backup = JSON.parse(value);
  if (backup?.version !== 1 || !Array.isArray(backup.items) || !backup.items.every(validEntry) ||
      new Set(backup.items.map((entry) => entry.id)).size !== backup.items.length) {
    throw new Error("Invalid workspace backup");
  }
  return backup.items;
}

function read() {
  try {
    const saved = localStorage.getItem(storageKey);
    return saved === null ? [] : parseBackup(saved);
  } catch {
    storageBroken = true;
    $("storage-notice").hidden = false;
    $("storage-notice").textContent = "无法读取本地工作台数据。当前记录保留在浏览器中，可使用备份文件恢复。";
    return [];
  }
}

let items = read();

function snapshot(entries = items) {
  return JSON.stringify({ version: 1, items: entries }, null, 2);
}

function persist(next, recovering = false) {
  try {
    if (storageBroken && !recovering) return false;
    localStorage.setItem(storageKey, snapshot(next));
    window.HarveyCloud?.changed();
  } catch {
    $("storage-notice").hidden = false;
    $("storage-notice").textContent = "浏览器未能保存更改。请检查存储权限或剩余空间。";
    return false;
  }
  storageBroken = false;
  $("storage-notice").hidden = true;
  items = next;
  render();
  return true;
}

function notice(message) {
  clearTimeout(noticeTimer);
  $("workspace-notice").textContent = message;
  $("workspace-notice").hidden = false;
  noticeTimer = setTimeout(() => { $("workspace-notice").hidden = true; }, 4500);
}

function ofType(type) {
  return items.filter((entry) => entry.type === type);
}

function tasksOn(day) {
  return ofType("task").filter((entry) => entry.repeat ? day >= entry.day : day === entry.day);
}

function coursesOn(day) {
  return ofType("course").filter((entry) => entry.weekday === day).sort((a, b) => a.start.localeCompare(b.start));
}

function editButton(entry) {
  return '<button type="button" class="quiet" data-edit="' + html(entry.id) + '" aria-label="编辑 ' +
    html(entry.title) + '">编辑</button>';
}

function entryTitle(entry, detail = "") {
  return '<div class="item-title"><strong>' + html(entry.title) + '</strong>' + detail + '</div>';
}

function meta(value) {
  return '<span class="item-meta">' + html(value) + '</span>';
}

function renderList(element, rows, empty) {
  $(element).innerHTML = rows.length ? rows.join("") : '<li class="empty">' + empty + '</li>';
}

function renderTasks() {
  const day = taskDay();
  const tasks = tasksOn(day);
  const checked = (entry) => entry.checked.includes(day);
  const completed = tasks.filter(checked).length;
  $("task-progress").max = Math.max(1, tasks.length);
  $("task-progress").value = completed;
  $("task-count").textContent = "已完成 " + completed + " / " + tasks.length;
  tasks.sort((a, b) => Number(checked(a)) - Number(checked(b)) || Number(b.important) - Number(a.important));
  renderList("task-list", tasks.map((entry) => {
    const detail = [entry.important ? "重要" : "", entry.repeat ? "每天重复" : ""].filter(Boolean).join(" · ");
    return '<li class="item-row ' + (checked(entry) ? "is-done" : "") + (entry.important ? " is-important" : "") + '">' +
      '<input class="task-check" type="checkbox" data-toggle="' + html(entry.id) + '" aria-label="完成 ' +
      html(entry.title) + '"' + (checked(entry) ? " checked" : "") + '>' +
      entryTitle(entry, detail ? meta(detail) : "") + editButton(entry) + "</li>";
  }), "这一天还没有待办。");
}

function renderCourses() {
  const weekday = new Date().getDay();
  $("week-days").innerHTML = displayWeek.map((day) =>
    '<button type="button" data-weekday="' + day + '" aria-pressed="' + (day === viewedWeekday) +
    '"' + (day === weekday ? ' aria-current="date"' : "") + '>周' + weekdays[day] + "</button>"
  ).join("");
  renderList("course-list", coursesOn(viewedWeekday).map((entry) =>
    '<li class="item-row"><span class="item-time">' + entry.start + "–" + entry.end + "</span>" +
    entryTitle(entry, entry.place ? meta(entry.place) : "") + editButton(entry) + "</li>"
  ), "周" + weekdays[viewedWeekday] + "还没有课程。");
}

function countdownValue(at, now) {
  const remaining = Math.ceil((moment(at) - now) / 1000);
  if (remaining <= 0) return "已到期";
  const days = Math.floor(remaining / 86400);
  const hours = Math.floor(remaining % 86400 / 3600);
  const minutes = Math.floor(remaining % 3600 / 60);
  const seconds = remaining % 60;
  return days + "<span> 天</span> " + pad(hours) + "<span> 时</span> " +
    pad(minutes) + "<span> 分</span> " + pad(seconds) + "<span> 秒</span>";
}

function renderCountdown(now) {
  const entries = ofType("countdown").sort((a, b) => moment(a.at) - moment(b.at));
  const featured = entries.find((entry) => moment(entry.at) > now);
  const feature = $("countdown-feature");
  feature.hidden = !featured;
  feature.innerHTML = featured
    ? '<div class="countdown-feature-head"><strong>' + html(featured.title) + "</strong>" + editButton(featured) +
      '</div><div class="countdown-value" id="countdown-value"></div>' +
      '<span class="item-meta">截止 ' + when(featured.at) + "</span>"
    : "";
  if (featured) feature.dataset.at = featured.at;
  else delete feature.dataset.at;
  const rows = entries.filter((entry) => entry !== featured).map((entry) => {
    const detail = when(entry.at) + (moment(entry.at) <= now ? " · 已到期" : "");
    return '<li class="item-row">' + entryTitle(entry, meta(detail)) + editButton(entry) + "</li>";
  });
  if (entries.length) $("countdown-list").innerHTML = rows.join("");
  else renderList("countdown-list", [], "添加考试、交付或其他重要日期。");
  tickCountdown(now);
}

function tickCountdown(now) {
  const target = $("countdown-feature").dataset.at;
  if (target) $("countdown-value").innerHTML = countdownValue(target, now);
}

function renderReminders(now) {
  const entries = ofType("reminder").sort((a, b) => Number(a.done) - Number(b.done) || moment(a.at) - moment(b.at));
  renderList("reminder-list", entries.map((entry) => {
    const due = !entry.done && moment(entry.at) <= now;
    const detail = when(entry.at) + (due ? " · 已到时间" : "");
    return '<li class="item-row ' + (entry.done ? "is-done" : due ? "is-due" : "") + '">' +
      entryTitle(entry, meta(detail)) +
      '<button type="button" class="quiet" data-remind="' + html(entry.id) + '" aria-label="' +
      (entry.done ? "恢复 " : "完成 ") + html(entry.title) + '">' + (entry.done ? "恢复" : "完成") +
      "</button>" + editButton(entry) + "</li>";
  }), "暂无提醒。到时间后会在工作台上标出。");
}

function renderSummary(now) {
  const tasks = tasksOn(today).filter((entry) => !entry.checked.includes(today)).length;
  const classes = coursesOn(now.getDay()).length;
  const due = ofType("reminder").filter((entry) => !entry.done && moment(entry.at) <= now.getTime()).length;
  $("today-date").textContent = heroDate.format(now);
  $("today-date").dateTime = today;
  $("today-summary").textContent = tasks + " 项未完成待办 · " + classes + " 节课" + (due ? " · " + due + " 项提醒已到时间" : "");
}

function render() {
  const now = new Date();
  renderSummary(now);
  renderTasks();
  renderCourses();
  renderCountdown(now.getTime());
  renderReminders(now.getTime());
  renderList("note-list", ofType("note").map((entry) =>
    '<li class="item-row">' + entryTitle(entry, '<span class="item-meta note-text">' + html(entry.body) + "</span>") +
    editButton(entry) + "</li>"
  ).reverse(), "记下临时想法、课堂要点或稍后处理的事。");
  updateMoment.next = nextChange(now.getTime());
}

function nextChange(now) {
  return items.reduce((soonest, entry) => {
    if (entry.type !== "countdown" && (entry.type !== "reminder" || entry.done)) return soonest;
    const deadline = moment(entry.at);
    return deadline > now ? Math.min(soonest, deadline) : soonest;
  }, Infinity);
}

function updateMoment() {
  const now = new Date();
  const day = localDate(now);
  if (day !== today) {
    if (taskDay() === today) $("task-day").value = day;
    if (viewedWeekday === new Date(today + "T12:00").getDay()) viewedWeekday = now.getDay();
    today = day;
    render();
  } else if (now.getTime() >= updateMoment.next) {
    renderSummary(now);
    renderCountdown(now.getTime());
    renderReminders(now.getTime());
    updateMoment.next = nextChange(now.getTime());
  } else {
    tickCountdown(now.getTime());
  }
}

function showDialog(title, markup) {
  $("dialog-title").textContent = title;
  content.innerHTML = markup;
  if (!dialog.open) dialog.showModal();
  (content.querySelector("[autofocus]") ?? content.querySelector("button"))?.focus();
}

function showStudyModule(view, link) {
  if (!studyFrames.has(view)) {
    const frame = document.createElement("iframe");
    frame.title = link.dataset.title;
    frame.src = link.dataset.src;
    frame.allow = "autoplay; fullscreen";
    $("study-frames").append(frame);
    studyFrames.set(view, frame);
  }
  $("study-title").textContent = link.dataset.title;
  $("study-standalone").href = link.dataset.src;
}

function showView() {
  const fragment = location.hash;
  const requested = fragment.startsWith("#/") ? fragment.slice(2) : fragment.slice(1);
  const view = viewLinks.has(requested) ? requested : "today";
  const link = viewLinks.get(view);
  const overview = view === "today";
  const study = Boolean(link.dataset.src);
  $("workspace-main").dataset.mode = overview ? "overview" : study ? "study" : "tool";
  $("workspace-poster").hidden = !overview;
  $("overview-header").hidden = !overview;
  $("dashboard").hidden = study;
  $("dashboard").setAttribute("aria-labelledby", overview || study ? "dashboard-title" : view + "-title");
  $("study-view").hidden = !study;
  for (const widget of widgets) widget.hidden = !overview && widget.id !== view;
  for (const [key, item] of viewLinks) {
    if (key === view) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  }
  if (study) showStudyModule(view, link);
  for (const [key, frame] of studyFrames) frame.hidden = key !== view;
  document.title = overview ? "Harvey Space · 个人工作台" : (link.dataset.title ?? $(view + "-title").textContent) + " · Harvey Space";
  currentView = view;
}

window.addEventListener("hashchange", () => {
  showView();
  window.scrollTo(0, 0);
});

if (window.parent !== window) {
  window.parent.postMessage(moduleHomeMessage, "*");
}

window.addEventListener("message", (event) => {
  if (event.data !== moduleHomeMessage) return;
  for (const [view, frame] of studyFrames) {
    if (event.source !== frame.contentWindow) continue;
    frame.remove();
    studyFrames.delete(view);
    if (currentView === view) {
      location.hash = "/today";
      viewLinks.get("today").focus();
    }
    break;
  }
});

function field(label, control) {
  return '<label class="form-field"><span>' + label + "</span>" + control + "</label>";
}

function input(name, type, value, extra = "") {
  return '<input name="' + name + '" type="' + type + '" value="' + html(value) + '" ' + extra + ">";
}

function option(value, label, selected) {
  return '<option value="' + value + '"' + (String(value) === String(selected) ? " selected" : "") + ">" + label + "</option>";
}

function select(name, options) {
  return '<select name="' + name + '">' + options.join("") + "</select>";
}

function editor(type, entry) {
  const values = entry ?? {};
  const now = new Date();
  now.setMinutes(now.getMinutes() + (type === "countdown" ? 1440 : 30));
  const common = field(type === "course" ? "课程名称" : "标题", input("title", "text", values.title, "required autofocus maxlength=90"));
  let fields;
  switch (type) {
    case "task":
      fields = field("日期（重复待办的开始日期）", input("day", "date", values.day ?? taskDay(), "required")) +
        '<div class="form-pair">' +
        field("重复", select("repeat", [option("no", "仅当天", values.repeat ? "yes" : "no"), option("yes", "每天", values.repeat ? "yes" : "no")])) +
        field("优先级", select("important", [option("no", "普通", values.important ? "yes" : "no"), option("yes", "重要", values.important ? "yes" : "no")])) +
        "</div>";
      break;
    case "course":
      fields = field("每周", select("weekday", displayWeek.map((day) => option(day, "周" + weekdays[day], values.weekday ?? viewedWeekday)))) +
        '<div class="form-pair">' + field("开始", input("start", "time", values.start ?? "09:00", "required")) +
        field("结束", input("end", "time", values.end ?? "10:00", "required")) + "</div>" +
        field("教室或地点", input("place", "text", values.place, "maxlength=90"));
      break;
    case "countdown":
    case "reminder":
      fields = field(type === "countdown" ? "截止时间" : "提醒时间",
        input("at", "datetime-local", values.at ?? localDate(now) + "T" + localTime(now), "required"));
      break;
    case "note":
      fields = field("内容", '<textarea name="body" rows="4" maxlength="1500">' + html(values.body) + "</textarea>");
      break;
  }
  showDialog((entry ? "编辑" : "添加") + labels[type],
    '<form class="workspace-form" data-type="' + type + '" data-id="' + html(values.id) + '">' + common + fields +
    '<p class="form-error" role="alert" hidden></p><div class="form-actions">' +
    (entry ? '<button class="quiet danger" type="button" data-delete="' + html(entry.id) + '">删除</button>' : "") +
    '<button class="quiet" type="button" data-action="close">取消</button><button class="action primary">保存</button></div></form>');
}

function submitEntry(form) {
  const existing = items.find((entry) => entry.id === form.dataset.id);
  const type = form.dataset.type;
  const values = new FormData(form);
  const get = (name) => String(values.get(name) ?? "").trim();
  const entry = { id: existing?.id ?? crypto.randomUUID(), type, title: get("title") };
  switch (type) {
    case "task":
      entry.day = get("day");
      entry.repeat = get("repeat") === "yes";
      entry.important = get("important") === "yes";
      entry.checked = existing?.checked ?? [];
      if (!entry.repeat && existing && !existing.repeat) {
        entry.checked = existing.checked.includes(existing.day) ? [entry.day] : [];
      }
      break;
    case "course":
      Object.assign(entry, { weekday: Number(get("weekday")), start: get("start"), end: get("end"), place: get("place") });
      break;
    case "countdown":
    case "reminder":
      entry.at = get("at");
      if (type === "reminder") entry.done = existing?.at === entry.at && existing.done;
      break;
    case "note":
      entry.body = get("body");
      break;
  }
  const error = form.querySelector(".form-error");
  if (!validEntry(entry)) {
    error.textContent = type === "course" && entry.start >= entry.end ? "结束时间必须晚于开始时间。" : "请检查标题和日期。";
    error.hidden = false;
    return;
  }
  const next = existing ? items.map((item) => item.id === entry.id ? entry : item) : [...items, entry];
  if (!persist(next)) {
    error.textContent = "保存失败，请查看工作台上的存储提示。";
    error.hidden = false;
    return;
  }
  if (type === "task") {
    $("task-day").value = entry.repeat && taskDay() >= entry.day ? taskDay() : entry.day;
    renderTasks();
  }
  if (type === "course") {
    viewedWeekday = entry.weekday;
    renderCourses();
  }
  dialog.close();
  if (existing) focusItem(entry.id);
}

function focusItem(id) {
  document.querySelector('[data-edit="' + id + '"]')?.focus();
}

function showSettings() {
  showDialog("数据管理", '<p class="dialog-info">工作台记录保存在当前浏览器。可以在「全站云同步」里开启跨设备同步，也可以手动导出备份。</p>' +
    '<div class="quick-options"><button class="action" type="button" data-action="export">导出备份</button>' +
    '<button class="action" type="button" data-action="import">导入备份</button></div>');
}

function exportBackup() {
  if (storageBroken) {
    dialog.close();
    notice("现有数据无法读取，暂时无法导出。");
    return;
  }
  const url = URL.createObjectURL(new Blob([snapshot()], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "Harvey-Space-" + today + ".json";
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function importBackup(file) {
  if (!file) return;
  try {
    const imported = parseBackup(await file.text());
    const known = new Set(items.map((entry) => entry.id));
    const additions = imported.filter((entry) => !known.has(entry.id));
    if ((additions.length || storageBroken) && persist([...items, ...additions], true)) {
      notice("已导入 " + additions.length + " 条记录。现有记录优先保留。");
    } else if (!additions.length && !storageBroken) {
      notice("备份中没有可新增的记录。");
    }
  } catch {
    notice("无法导入这个文件，请选择 Harvey Space 导出的 JSON 备份。");
  }
  dialog.close();
}

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const { action, add, edit, weekday, remind, delete: remove } = button.dataset;
  if (add) editor(add);
  if (edit) {
    const entry = items.find((item) => item.id === edit);
    if (entry) editor(entry.type, entry);
  }
  if (weekday !== undefined) {
    viewedWeekday = Number(weekday);
    renderCourses();
    document.querySelector('[data-weekday="' + viewedWeekday + '"]').focus();
  }
  if (remind) {
    if (persist(items.map((entry) => entry.id === remind ? { ...entry, done: !entry.done } : entry))) {
      document.querySelector('[data-remind="' + remind + '"]')?.focus();
    }
  }
  if (remove) {
    const entry = items.find((item) => item.id === remove);
    if (entry && confirm("删除「" + entry.title + "」？") && persist(items.filter((item) => item.id !== remove))) {
      dialog.close();
      document.querySelector(".widget [data-add=" + entry.type + "]")?.focus();
    }
  }
  switch (action) {
    case "close": dialog.close(); break;
    case "quick":
      showDialog("快速添加", '<div class="quick-options">' + Object.entries(labels).map(([type, label]) =>
        '<button class="action" type="button" data-add="' + type + '">＋ ' + label + "</button>"
      ).join("") + "</div>");
      break;
    case "today-tasks": $("task-day").value = today; renderTasks(); break;
    case "settings": showSettings(); break;
    case "export": exportBackup(); break;
    case "import": $("backup-file").click(); break;
  }
});

document.addEventListener("change", (event) => {
  const input = event.target;
  if (input.id === "task-day") {
    if (!isDate(input.value)) input.value = today;
    renderTasks();
  }
  if (input.dataset.toggle) {
    const id = input.dataset.toggle;
    const day = taskDay();
    const next = items.map((entry) => entry.id === id ? {
      ...entry,
      checked: input.checked ? [...new Set([...entry.checked, day])] : entry.checked.filter((date) => date !== day)
    } : entry);
    if (persist(next)) document.querySelector('[data-toggle="' + id + '"]')?.focus();
    else input.checked = !input.checked;
  }
  if (input.id === "backup-file") {
    importBackup(input.files[0]);
    input.value = "";
  }
});

content.addEventListener("submit", (event) => {
  event.preventDefault();
  submitEntry(event.target);
});

window.addEventListener("storage", (event) => {
  if (event.key !== storageKey && event.key !== null) return;
  storageBroken = false;
  $("storage-notice").hidden = true;
  items = read();
  render();
});

$("task-day").value = today;
render();
showView();
setInterval(updateMoment, 1000);
document.addEventListener("visibilitychange", updateMoment);
