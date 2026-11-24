const listeningExplanations = [
  [
    [
      "调查员登记完出生年份后，请 Sadie 报邮编。",
      "写 DW30 7YZ，中间空格可省。Wells 和 Harborne 是随后确认的地名。"
    ],
    [
      "调查员说 4 月 24 日，Sadie 一度以为是 25 日，马上改口同意。",
      "actually, you're right 确认最初日期。日期空格填 24 April 或 24th April。"
    ],
    [
      "调查员看见她买过东西，她补充说主要是去看牙医。",
      "the main reason ... go to the dentist。shopping 已写在笔记中，补的是另一项行程。"
    ],
    [
      "她很早就不再开车进城，因为车位难找而且花钱多。",
      "parking 是 costs so much 的指代对象。题干 cost of 后填停车，公交车程 30 分钟与花费无关。"
    ],
    [
      "调查员问从哪里上车，Sadie 说在 Claxby Street 公交站。",
      "听确认拼法 C-L-A-X-B-Y。题干已经印出 Street，不重复写。"
    ],
    [
      "她说准点时方便快捷，但今天早上的车晚了约 10 分钟。",
      "but 后是本次投诉。题干 bus today was 后要形容词 late，而非迟到多久。"
    ],
    [
      "她晚上进城吃饭或看电影时，发现要等很久，因为车很少。",
      "there aren't that many 对应班次少，in the evening 是发生时段。during the day 只是她平时乘车的时间。"
    ],
    [
      "Sadie 说自己不常开车，主要用它去超市。",
      "题目追踪 Sadie 本人。去 golf club 的是她丈夫，并非这一空的目的地。"
    ],
    [
      "谈租用城市自行车时，她说不爱在市中心骑车是因为空气污染。",
      "not keen on 等于 dislikes。她想骑车上班，说明她并不排斥在所有地方骑车。"
    ],
    [
      "她住二楼，家里没有放自行车的地方，只能放门外走廊。",
      "doesn't have any storage 对应 a lack of storage。楼层交代住房情况，不是题干要求的原因词。"
    ],
    [
      "讲者加了座位，所以大家有地方坐，但后排变得有些挤。",
      "C。a bit squashed 对应椅子太密。extra seats 排除了座位不够。"
    ],
    [
      "志愿者可以 16 岁，也可以 60 岁以上，可靠等品质才关键。",
      "A。讲者说可靠性与年龄无关。举年龄范围不代表大多数人是 60 岁。"
    ],
    [
      "培训贯穿上岗前、工作中和之后。",
      "A。before, during and after 说明培训持续进行。培训面授，常由资深志愿者负责。"
    ],
    [
      "讲者用 dedication 和忠诚志愿者投入精力的例子说明看重什么。",
      "B。dedication 对应 commitment。收入由本人衡量，机构不询问。本双选 B、E 顺序不限。"
    ],
    [
      "讲者要求确认每天有足够的时间承担约定工作。",
      "E。enough hours in the day 对应 availability。工作经历或个人愿望只是参加动机。本双选 B、E 顺序不限。"
    ],
    [
      "筹款时讲者期待有创意、能想出不常见办法的人。",
      "B。imaginative or novel 对应 original, new ideas。店铺收款箱只是传统做法的例子。"
    ],
    [
      "捡垃圾要能走很长时间，有时还得爬坡。",
      "G。条件指向体能。年纪大的常客也很活跃，年龄并不是所需条件。"
    ],
    [
      "Playmates 通过课外活动教儿童保持健康，了解营养会有帮助。",
      "D。nutrition 对应 food and diet。讲者说本人不必有孩子，排除以育儿经验作匹配。"
    ],
    [
      "故事俱乐部根据孩子读过的书演出，希望有人协助戏剧活动。",
      "A。have done some acting 对应 experience on stage。听到 books 后还要继续听具体要求。"
    ],
    [
      "急救组新手要吸收大量信息，并且不能忘掉关键步骤。",
      "F。take in information 与 not forget 都指向记忆力。以后教别人是后续任务。"
    ],
    [
      "Chantal 早到找到了座位，但后来一名很高的人坐在她正前方。",
      "A。换座因为视线被挡。Hugo 猜旁边聊天，她立即否认。"
    ],
    [
      "两人原本知道时装业竞争激烈，却没想到有时尚新闻等这么多岗位。",
      "B。whole range 和 so many career options 指工作种类多。竞争并非新发现。"
    ],
    [
      "讲者多次假定学生有错误想法再纠正，Chantal 觉得话说得重。",
      "A。Hugo 也说他们才一年级、还在学，认同她对学生有些苛刻。两人能跟上内容。"
    ],
    [
      "他们中学有不少职业讲座，在需要的时候也会安排。",
      "C。批评的是缺少真正懂行业的专家来讲。numerous 和 just when 排除数量和时机。"
    ],
    [
      "Chantal 想读到课程最后再决定，Hugo 希望现在就选好方向。",
      "B。分歧是何时定职业方向。两人没有争论哪个具体岗位最好。"
    ],
    [
      "Hugo 预期要当较长时间的无薪助理，并说自己做好了准备。",
      "A。I'm prepared for that 表示务实接受行业现状。拒绝接受这个前提的是 Chantal。"
    ],
    [
      "讲者的客户批评她比起给他搭配，更注重自己的外表，她承认他说得对。",
      "B。工作应围绕客户形象。她当时追求经验，并非高收入。本双选 B、E 顺序不限。"
    ],
    [
      "她回顾时说应该把对客户的负面感情藏起来，但自己没做到。",
      "E。没有掩饰不满对应 openly disliking her client。并未承认欺骗老板。本双选 B、E 顺序不限。"
    ],
    [
      "两人谈到顾客退货，举例贵店的衣物洗过就散开。",
      "A。这个例子针对退货原因。设计师能由此了解衣物的问题。本双选 A、C 顺序不限。"
    ],
    [
      "Hugo 说去店里可发现顾客找却没有商家销售的东西，Chantal 同意。",
      "C。gap in the market 对应想买却找不到的款式。平均尺码被 Hugo 认为更关乎制造商。本双选 A、C 顺序不限。"
    ],
    [
      "象群找食物走到园区之外，常把围栏撞倒，维修昂贵。",
      "knocking down 对应 damage。food 竞争已在上一条笔记交代，空格填 fences。"
    ],
    [
      "每批迁移 8 到 20 头，成员必须属于同一个家族。",
      "belonging to one family 对应 from the same family。前两个数字是群体规模。"
    ],
    [
      "兽医和护林员乘直升机在园区上空寻找并驱赶象群到平地。",
      "题目问引导象群时所用设备，填 helicopters。麻醉镖用于赶到平地之后。"
    ],
    [
      "麻醉时大象还在跑，团队要尽快剂量判定并打镖。",
      "minimise the stress 对应 reduce stress。迅速进行是为了减少应激。"
    ],
    [
      "大象倒下后不能趴在胸部，否则肺会被压。",
      "团队把它们摆成侧卧，placed on their sides，填复数 sides。chests 是要避免的姿势。"
    ],
    [
      "等待兽医检查时，一人守着一头象，盯住每分钟的呼吸次数。",
      "keep an eye on breathing 对应不断监测。低于六次是急救阈值。"
    ],
    [
      "装完跟踪项圈后，团队量了象牙，也测量了脚的尺寸。",
      "tusks 已给出，原文 and also of their feet 提供第二个测量对象。"
    ],
    [
      "迁移成功后，当地居民的工作前景和生活水平得到改善。",
      "employment prospects 对应 employment opportunities。题干已给 opportunities，填 employment。"
    ],
    [
      "以前的盗猎者找到更可靠的收入，自愿上交武器。",
      "give up their weapons 支持武器数量下降。空格与 poachers 并列。"
    ],
    [
      "末尾谈大象吸引游客，并比较旅游和非法野生动物贸易对 GDP 的贡献。",
      "tourism 是增加且贡献于 GDP 的产业，非法贸易只是比较项。"
    ]
  ],
  [
    [
      "对方介绍 Milo’s 福利时说，所有员工都可得到培训，连临时工也包括在内。",
      "all employees ... even temporary staff 对应 for all staff。免费制服只是求职者随后询问的内容。"
    ],
    [
      "任何一家 Milo’s 门店都能享受折扣；求职者问周末可不可以，答不行。",
      "at any of their restaurants 对应 all locations。题干已限定 weekdays，空格是福利 discount。"
    ],
    [
      "晚上下班超过午夜，公司会付车费让员工回家。",
      "company will pay for you to get a taxi 对应 taxi provided。骑车只是求职者自己的打算。"
    ],
    [
      "求职者提到以前工作要求 high level of service，对方说 Milo’s 也同样重视。",
      "high level 与 high standard 同义。团队合作已列，空格填所要维持的 service。"
    ],
    [
      "谈到岗位要有良好沟通能力时，对方说需要一份英语证书。",
      "certificate 对应 qualification。问题要的是证书科目 English，不是写 communication。"
    ],
    [
      "第一个空缺是早餐主管，地址在 Wivenhoe Street，对方逐字拼写。",
      "写 W-I-V-E-N-H-O-E。Cork Street 只是这条街附近的参照路名。"
    ],
    [
      "核对餐份之后，早餐主管还要检查清洁程序有没有落实。",
      "procedures for cleaning the equipment 对应确保设备干净。题干已经有 is clean。"
    ],
    [
      "对方报一开始 £9.75，三个月后涨到 £11.25。",
      "to begin with 对应 starting salary。£9.50 是上一份工作薪资。"
    ],
    [
      "City Road 分店初级厨师负责确保库存充足，还要处理送货。",
      "sorting out all the deliveries 对应 organising deliveries。stock 是并列的上一项职责。"
    ],
    [
      "餐厅星期一关门，但对方还说每四周可以休一个星期日。",
      "题干限定 once a month，选 Sunday。星期一是周周关店，不符合频率。"
    ],
    [
      "讲者说离医院 15 公里，中学更近，这是他们更看重的一点。",
      "B。医院和学校是现成的本地设施。机场虽近，但并非选址的主要标准。本双选 B、E 不限顺序。"
    ],
    [
      "Nunston 新工业中心带来住房需求，不少员工现在得通勤很远。",
      "E。住宅能方便员工上下班。坡陡反而是缺点，原文没有评价农业用地价值低。本双选 B、E 不限顺序。"
    ],
    [
      "居民喜欢总体设计融入自然景观，也赞成保护树木和野生动物。",
      "B。谈的是项目对环境的处理。希望增加自行车设施是改进建议。本双选 B、C 不限顺序。"
    ],
    [
      "总体反馈认为不同年龄居民可以在这种布局与设施下和睦共住。",
      "C。live together happily 对应促进居民关系。户型及价格多样不能推出全部便宜。本双选 B、C 不限顺序。"
    ],
    [
      "从图底部 South Entrance 进入，沿主路向上，数第二条向左的岔路。",
      "G。学校在主路和第二个左转路口的转角。第一条左岔是易数错的参照。"
    ],
    [
      "先找西侧 London Road，再找从它向小区内部伸出的路。",
      "C。体育中心在这条支路正下方。western side 限定看地图左边。"
    ],
    [
      "找地图上方的湖，诊所在湖的正下方，同时在一条住宅街右边。",
      "D。below the lake 和 to the right of a street 都必须满足。"
    ],
    [
      "东北侧有一排专为 65 岁以上居民设计的住宅。",
      "B。adjoining 表示紧紧相邻，社区中心就在该排住宅旁边。"
    ],
    [
      "超市在两个出入口之间，靠近 London Road 那三棵保留下来的大树。",
      "H。just to the south of these 的 these 指三棵树，按图向下找。"
    ],
    [
      "从南入口沿主路走到顶部，路向左弯。",
      "A。in that curve 指弯道包住的位置。能看到湖是补充定位。"
    ],
    [
      "Michelle 强调火山喷发直接和间接影响政治，也带来巨大社会和经济后果。",
      "C。Adam 同意把这个作为报告主线。开始理解科学是背景，不能换成正式建立学科。"
    ],
    [
      "当时观察报告总体一致，但 Adam 意外那时已经有很多气象站。",
      "A。many weather stations 对应有许多地点留下记录。术语不同不代表记录矛盾。"
    ],
    [
      "Michelle 说当年的报道把浓霾与头痛、呼吸问题和哮喘增多联系起来。",
      "B。病症属于 health issues。这与普通雾不同，太阳变红也不等于完全挡住。"
    ],
    [
      "Michelle 认为 Franklin 比任何人都早看出成因，Adam 说有法国博物学家更早。",
      "B。beat him to it 专门纠正“第一个”的次序，不是在说 Franklin 的成因判断错了。"
    ],
    [
      "喷发两年后，北美和北非这样远的地方还传来异常天气报告。",
      "A。as far away as 对应影响范围广。火山灰传播迅速是 Adam 认为预料得到的。本双选 A、B 不限顺序。"
    ],
    [
      "Adam 说没想到影响持续那么久，Michelle 也觉得难以置信。",
      "B。go on for so long 对应 long-lasting。死亡人数多是他们预料中的后果。本双选 A、B 不限顺序。"
    ],
    [
      "冰岛放牧牲畜吃了受火山落尘中氟污染的草木而中毒。",
      "D。livestock were poisoned 是动物患病的依据。农业重创是总体背景。"
    ],
    [
      "埃及干旱导致尼罗河没有泛滥、庄稼绝收，饥荒造成极大人员伤亡。",
      "A。对话突出埃及死亡之严重，甚至说超过瘟疫；没讨论最高粮价。"
    ],
    [
      "英国死亡率大约翻倍，其中不到 25 岁的人比例异常高。",
      "C。under the age of 25 对应 young people。呼吸系统疾病是推测原因。"
    ],
    [
      "美国弗吉尼亚被大雪困到三月，密西西比河还出现反常浮冰。",
      "F。snowbound 和 unprecedented ice 共同指向异常严酷的冬季。"
    ],
    [
      "讲者说装手机或信用卡时口袋很方便，却容易被人忽视。",
      "nothing is quite as convenient 与后文 overlooked 构成题干两面的描述，填 convenient。"
    ],
    [
      "介绍 18 世纪男装时，讲者说那时 suits 开始流行。",
      "裤子、背心和外套是接着解释的三部分。空格要整套服装，写 suits。"
    ],
    [
      "三件衣物都有内衬，裁缝把口袋缝进这层布料。",
      "原文 by whichever tailor 转换成题目的主动句 A tailor sewed。lining 是被缝的位置。"
    ],
    [
      "医生等有特定职业的人要携带器具，外套口袋常做得更大、更朴素。",
      "doctor 是 profession 的示例。题目用 a certain type of，问的是职业类别。"
    ],
    [
      "讲者对比男女口袋，女性的没男性的那么显眼，也难够到。",
      "weren't nearly as visible 对应 were less visible。easy to reach 是另一项比较。"
    ],
    [
      "女性的两只布口袋是一对，用绳系在一起。",
      "tied together with string 对应 using string to link them。布料是口袋本身的材料。"
    ],
    [
      "女性把口袋系在腰间，让其垂在裙服和衬裙下。",
      "around their waist 对应 hung from their waist，单复数均接受。裙子是遮挡物。"
    ],
    [
      "裙褶留有开口，可以伸手取出所需物品，讲者举了香水。",
      "through an opening 对应 through a gap。男性的铅笔和硬币在前文，别混用。"
    ],
    [
      "服装变得更紧，成对口袋凸出，影响女性的外在形象。",
      "detracted from ... image 等于 had a negative effect on ... image。明显凸出是原因。"
    ],
    [
      "口袋逐渐不再方便时，小袋 pouches 流行，后来发展为现代手提包。",
      "led on to 表示先后演进。题干已经给 pouches，填单数 handbag。"
    ]
  ],
  [
    [
      "Dan 报出门牌 52 和街名，Breda 随后拼写并求确认。",
      "填 Marrowfield，double R 要写成 rr。Street 和 Peacetown 题目已经给出。"
    ],
    [
      "Breda 猜他上网找到俱乐部，Dan 说这次其实是一位亲属推荐。",
      "this time 引出本次途径。relative 是推荐人，他加入的是另一家俱乐部。"
    ],
    [
      "Dan 先说喜欢参赛，又说想跟其他摄影爱好者交往。",
      "also 引出第二项，to 后用动词 socialise 或 socialize。with other photographers 说明对象。"
    ],
    [
      "Breda 列 £30 正式会员和 £20 准会员，Dan 选前者。",
      "£30 对应 full，后面投票权也确认是正式会员。"
    ],
    [
      "第一场比赛主题是居家场景，Dan 提到一家人围桌吃饭。",
      "题干要填比赛标题 Domestic Life；家庭晚餐是他选择的取景内容。"
    ],
    [
      "拍美丽日落时，要求同时拍到云，不能只有蓝天和太阳。",
      "capture the clouds 对应 scene must show some clouds。粉紫色是云在日落时的色彩。"
    ],
    [
      "评委说他该再等等才按快门，Dan 承认拍得太早。",
      "Breda 概括为 timing wasn't right。上一场的问题才是 composition。"
    ],
    [
      "Dan 从日落拍摄转到第三场比赛，直接报出题名。",
      "Animal Magic 是完整标题，符合不超过两词。狐狸是拍摄对象。"
    ],
    [
      "拍动物要表现它们在动，Dan 确认这就是赛事要求。",
      "some movement in the scene 对应 show movement，animal movement 也符合词数。"
    ],
    [
      "狐狸照片是在晚上拍的，Dan 猜照片有点暗，反馈证实了。",
      "题干说 too 后面要填亮度评价 dark。night 是拍摄时间。"
    ],
    [
      "Dan 明确提醒避开长在繁忙道路旁的蘑菇。",
      "B。growing beside busy roads 对应选项。商店蘑菇不够新鲜只是评价风味。本双选 B、C 顺序不限。"
    ],
    [
      "Dan 说别食用朋友或邻居采来的野生蘑菇，因为毒菇可能很像可食用种类。",
      "C。picked by friends or neighbours 对应别人送来的蘑菇；题目未说采摘时吃。本双选 B、C 顺序不限。"
    ],
    [
      "演讲末尾反驳了一条判断依据，鹿或松鼠吃某种蘑菇不代表人能吃。",
      "B。动物能吃不能证明对人安全。气味也不能识别毒菇。本双选 B、D 顺序不限。"
    ],
    [
      "Dan 举鲜红色的可食用品种，反驳颜色淡才可食用的说法。",
      "D。can be edible 表示存在这种情况，并非凭颜色即可判断安全。去皮并非题中所述必要条件。本双选 B、D 顺序不限。"
    ],
    [
      "讲者说公园里有很多地方会长蘑菇，但最好清早到，别人和动物都可能捷足先登。",
      "C。first thing in the morning 对应 get there early。林地只是所列生境之一。"
    ],
    [
      "Dan 建议完全没经验的人跟由专家带队的小组。",
      "B。照片或书不能单独依赖，手机 App 也可能遇到无信号，所以推荐加入小组。"
    ],
    [
      "讲者说保育的基本要求之一是从一处只取满足自己需要的数量。",
      "B。only enough for your own needs 对应 limited amount。勿踩幼菇并不等于只采全长成的。"
    ],
    [
      "当地某些品种减少，讲者说最大的原因是过去十年新建了很多房子。",
      "C。new houses 对应 building developments，后面说明用水增加、栖息地被破坏。餐馆需求被提到却非主因。"
    ],
    [
      "讲者区分了采集时装纸袋和到家后的冷藏。",
      "A。a couple of days 对应两天。纸袋是采集容器，洗后应尽快烹调。"
    ],
    [
      "讲者最后谈不同菜式，建议大胆尝试，举了炒菜、烩饭和意面。",
      "A。be adventurous 与多种菜式对应尝试不同做法。没说必须长时间烹煮。"
    ],
    [
      "Luddites 砸坏织机想避免失业，两人讨论行动的实际结果。",
      "A。didn't achieve anything 对应 ineffective；工业化创造更多岗位是后续背景。本双选 A、E 顺序不限。"
    ],
    [
      "两人从当时工人的处境看待他们的反应。",
      "E。一人理解他们为何受威胁，另一人说自己也会这样感受。理解这种态度不等于赞成砸机器。本双选 A、E 顺序不限。"
    ],
    [
      "女生怀疑失业率会降低，男生说即便长远有可能，短期也难看到。",
      "B。lower unemployment 是他们共同保留意见的预测。本双选 B、D 顺序不限。"
    ],
    [
      "男生质疑会有更多空闲时间，因为证据显示人们工作时间更长，女生认可。",
      "D。更多空闲隐含工时缩短，他们指出相反趋势。她对少做重复工作态度积极。本双选 B、D 顺序不限。"
    ],
    [
      "两人说会计本来像是会被技术取代，结果人数多于过去，且工作更高效。",
      "G。more of them 与 more efficient 分别对应就业增长和生产效率提高。"
    ],
    [
      "理发师相对于人口的数量明显多了，原因是人们赚钱能力增强，愿意多花在个人服务上。",
      "E。earning power 和 afford to spend more 对应可支配收入提高。工作本身变化不大。"
    ],
    [
      "过去行政人员做听写和打字，现在有更大的责任和更高地位。",
      "B。boring compared to these days 表明职责比以前有意思。提到许多毕业生进入不等于必须新增资格。"
    ],
    [
      "他们对比 1871 年约 25% 的人务农与现在不到 0.2%。",
      "C。两个数字共同表明行业人力大幅下降。超过 50% 是男生原先的猜测。"
    ],
    [
      "过去由于寿命短很少有护理工作，现在需求已难满足，这个行业还将大幅增长。",
      "F。will see huge growth 和 current demand 对应未来服务需求上升。"
    ],
    [
      "自 ATM 引入以来银行柜员已减少，技术还可能让大部分工作变得不再需要。",
      "A。redundant 指岗位或职责被替代，说明未来面临风险。"
    ],
    [
      "讲者说避免碰撞需要法律措施，还得开发技术系统。",
      "legal measures 和 technical systems 对应 legal and technical ways。systems 已被题干概括。"
    ],
    [
      "如今比以前更容易负担发射卫星的成本，所以卫星数量增加。",
      "讲者说 relatively cheap，语义和 quite cheap 对应。空格需形容词。"
    ],
    [
      "有些人发射一整组协同卫星，规模达数千颗。",
      "consisting of thousands 对应 made up of thousands。题干已有 of satellites。"
    ],
    [
      "卫星在轨后不必传回可让人辨认它们的信息。",
      "allow its identification 对应 help with their identification。这里问识别身份，不是追踪位置。"
    ],
    [
      "航空器有国际定位系统，对卫星则缺少足够的相应手段。",
      "proper ways of tracking 对应 systems for tracking。题干用 for，填动名词。"
    ],
    [
      "运营者不愿公开详情，有的卫星为军事用途，有的出于商业原因。",
      "military purposes 对应 military reasons。commercial 已写在题目中。"
    ],
    [
      "需要收集物体本身的详情，也要知道它某一时刻的位置。",
      "at a particular time 对应 at a given time。运动太快解释为什么 location 难确定。"
    ],
    [
      "传感器不能持续跟踪高速物体，只能估计卫星下一个去向。",
      "put forward a prediction 对应 make a prediction。空格有冠词 a，用单数。"
    ],
    [
      "统一标准收集的信息还需汇总，让大家有地方录入、使用。",
      "a single database 对应 one database。共同标准是前一项措施。"
    ],
    [
      "讲者最后强调，协同系统需要取得使用者的信任。",
      "establishes trust 对应 create trust。national 和 global 描述覆盖范围，不是应建立的品质。"
    ]
  ],
  [
    [
      "Greg 说明新职位是接待员，并确认 Julie 以前做过类似工作。",
      "position for a receptionist 对应 Role。体育中心是她以前的工作地点。"
    ],
    [
      "Greg 说工作在 Fordham 的医疗中心。",
      "题干已经印出 Fordham 和 Centre，填写中间的 Medical。"
    ],
    [
      "医疗中心靠近车站，在 Chastons Road；Julie 问了一遍后 Greg 给出拼法。",
      "拼 C-H-A-S-T-O-N-S，保留结尾 s。Road 是题干已给的路名后半。"
    ],
    [
      "工作要接待咨询，还要当面或电话预约，有需要时改期。",
      "make appointments 并可 reschedule them，与 making 和 reorganising 并列吻合。"
    ],
    [
      "另一项主要职责是让中心的数据库保持最新。",
      "keeping the database up-to-date 对应 maintaining。一般办公室行政是另列的一项。"
    ],
    [
      "Greg 一看到要求就想到有体育中心工作经历的 Julie。",
      "do require someone with experience 对应 essential。体育中心是她具备经验的佐证。"
    ],
    [
      "患者常有压力，员工应保持冷静，并能自信地与公众打交道。",
      "stay calm and be confident 对应 a calm and confident manner。空格须用形容词。"
    ],
    [
      "Greg 说合同只到九月底，并可能有后续机会。",
      "临时合同对应 temporary。further opportunities 不表示本次工作已经是长期岗位。"
    ],
    [
      "Julie 追问几点下班，Greg 回答 one fifteen。",
      "填 1.15。quarter to eight 是早上七点四十五，题干已给该上班时间。"
    ],
    [
      "Julie 问中心是否给员工提供停车，Greg 确认有，也说公交可到。",
      "题干问现场能提供什么，填 parking。bus route 是另外的交通方式。"
    ],
    [
      "这栋楼 1880 年建作商人 Alfred Palmer 的家，后来才改作宿舍。",
      "B。题目限定 originally。饼干厂属于他的商业背景，宿舍是之后的用途。"
    ],
    [
      "大学使用楼的主体部分，导游说可以看到学生进去上课。",
      "A。for lessons 指教学空间。图书馆是旧用途，两间办公房是博物馆的。"
    ],
    [
      "入馆、常设馆和特展都免费，入口有自愿捐款箱。",
      "A。feel free to give 表示可由访客决定是否付钱以及金额。特展也不另外收费。"
    ],
    [
      "导游建议不用一直背沉重的背包，又提醒花园寒冷要穿好外套。",
      "C。rucksacks 对应 bags。相机也建议带着，因为允许拍照。"
    ],
    [
      "Four Seasons 有一部四分钟的林地动画，由影视课程的一群年轻人创作。",
      "F。a group ... on a film studies course 就是学生作者，动画是他们的作品。"
    ],
    [
      "Farmhouse Kitchen 展出老式奶油和奶酪设备，当天上午有奶酪专家现场示范。",
      "G。specialist cheesemaker 和 this morning 表明今天有专家。藏品古老与是否新增无关。"
    ],
    [
      "A Year on the Farm 的观众可以做记忆测试，回答关于展品的问题。",
      "E。memory test 对应 quiz。房间有时供学校参观，不等于只对校团体开放。"
    ],
    [
      "Wagon Walk 的车很古老脆弱，需要家长把孩子留在身边、不许攀爬。",
      "A。keep your children close 对应 supervise。这里还能折返，无单行限制。"
    ],
    [
      "花园角落的 Bees are Magic 正在改造，导游明确说暂不能参观。",
      "C。can't visit at the moment 对应今天关闭。店里仍能买蜂蜜。"
    ],
    [
      "导游在 The Pond 举了刚出生几天的小鸭和小青蛙。",
      "B。新出生的动物就是新能看到的东西。围栏和浅水是安全说明。"
    ],
    [
      "视频中孩子很仔细听讲，确保按正确顺序完成折鸟各步骤。",
      "B。do all the steps in the right order 对应 following instructions。自行解决问题是后续设想。本双选 B、D 不限顺序。"
    ],
    [
      "Lia 注意到孩子在学新东西的同时玩得很开心。",
      "D。having fun while being taught 对应 learning through play。视频中各自完成，不是小组合作。本双选 B、D 不限顺序。"
    ],
    [
      "Sid 开始前有点扰乱课堂，但动手折纸后平静下来，开始集中注意力。",
      "D。settle down 对应 calming。抓开始前与活动后的反差。"
    ],
    [
      "Jack 想自己试出办法，尝试不同做法，也没找老师帮忙。",
      "A。work things out for himself 表明独立性，排除请求教师支持。"
    ],
    [
      "Naomi 后来想把自己的老鼠折成最好的，所以更努力。",
      "C。wanted her mouse to be the best 是竞争心。最终对成品不满意，不能选 pleased。"
    ],
    [
      "Anya 听得仔细，没费多大力气就折出漂亮的鸟。",
      "G。very little effort 对应觉得容易。两人说可提高难度，进一步印证。"
    ],
    [
      "Zara 好像没明白发生了什么，也不确定自己该做哪一步。",
      "F。unsure about what she was supposed to do 对应困惑。成品还可以不代表过程毫无困惑。"
    ],
    [
      "老师预先准备了折鸟各阶段的实物，让孩子看清并拿在手里。",
      "A。examples showing each of the steps 对应分阶段示范模型。它们辅助口头解释，重点不是检查术语。"
    ],
    [
      "Seb 说很多老师像他一样手不灵巧，Lia 同意这会使活动费劲。",
      "B。clumsy、not good with your hands 指手工技能不足。Lia 先猜孩子兴趣不高，最终共同认可的是技能因素。"
    ],
    [
      "Seb 想用折纸引出接下来才要学的分数，Lia赞同。",
      "C。presenting fractions 对应引入新概念。几何形状是强化已有知识，对称上学期教过。"
    ],
    [
      "讲者介绍《悲惨世界》的改编后，说很多人了解大致情节，对作者知道得少。",
      "a general idea of the plot 对应 know its overall plot。题干问对作品了解的哪部分。"
    ],
    [
      "谈雨果早年时，讲者列举他公开谈论的贫困程度和教育问题。",
      "poverty 与 education 并列，education 已给出。浪漫主义是其文学身份。"
    ],
    [
      "拿破仑三世流放雨果，他被迫在欧洲其他地方居住。",
      "other parts of Europe 对应 elsewhere in Europe。Guernsey 是其中第三处。"
    ],
    [
      "流放前在法国售卖诗作挣的钱，用来买根西岛的房子。",
      "money made from the sale of his poetry 对应 income。此处问资金来源，别写在岛上创作的小说。"
    ],
    [
      "底层挂家庭成员肖像，还有他珍视的旅行画作，其他房间有挂毯。",
      "portraits 和 tapestries 间缺的是 drawings。图画是他旅途中所作。"
    ],
    [
      "雨果在市场买来相对便宜的木家具，用木料做墙饰和复杂雕刻。",
      "relatively inexpensive 对应 cheap；题干问买来的物品是 furniture，不能填成品 carvings。"
    ],
    [
      "楼上两间休息厅有中国风，讲者举墙纸式样和灯为例。",
      "同 wallpaper 并列是 lamps。沙发和红蓝配色是此前介绍的陈设。"
    ],
    [
      "他在顶楼 Lookout 写作，房名来自它俯瞰的景色。",
      "looks out over the harbour 对应 had a view of。harbour 或 harbor 均可。"
    ],
    [
      "除了名作家，他每周还邀请岛上贫困地区的一群本地孩子吃晚饭。",
      "deprived areas 对应 poor，空格是受邀的人 children。"
    ],
    [
      "1927 年房子由他的亲属所有，他们决定捐给巴黎市。",
      "donate it 对应 gave ownership。后来的修复者和博物馆访客不参与捐赠。"
    ]
  ]
];
