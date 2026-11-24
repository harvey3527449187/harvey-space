const listeningExplanations = [
  [
    [
      "Peter 说日常活动之一是 keep the beach free of litter。",
      "free of litter 对应题干 does not have ... on it。后面说清理并请游客把东西带走，指的仍是海滩上的垃圾。"
    ],
    [
      "Jan 问能否带狗，Peter 回答 they're banned from the beach itself。",
      "they 指 dogs。悬崖步道可以带狗，孩子也受欢迎，题目限制的地点是海滩。"
    ],
    [
      "鸟巢箱刚装好，Peter 紧接着说 next 要鼓励昆虫到保护区。",
      "encourage insects 对应 attract insects。鸟是已完成的巢箱项目，昆虫才是接下来的任务。"
    ],
    [
      "Peter 介绍一项辨认前来保护区的蝴蝶种类的项目。",
      "species 对应 types。moths 是 Jan 在以前居住地统计过的东西，当前小组辨认的是 butterflies。"
    ],
    [
      "Peter 提到南边停车区与柴棚之间的墙在风暴中损坏，正在更换。",
      "replace the wall 即拆旧换新，对应 building a new wall。停车区和柴棚只是定位。"
    ],
    [
      "下周六低潮时在海滩停车场集合，沿露出的沙地步行上岛。",
      "停车场是出发点，island 是走过沙地后的目的地。题干已给 the，填一个词即可。"
    ],
    [
      "Peter 提醒往返会踩水，务必保证 boots 防水。",
      "题干 wear appropriate 问穿什么。waterproof 说明靴子的要求，空格需要名词 boots。"
    ],
    [
      "Jan 问从没做过木工的人能否参加，Peter 肯定回答。",
      "她直接用了 beginners，后面的专家指导和限人数解释为什么初学者也适合参加。"
    ],
    [
      "Peter 说一天做椅子太难，先从 wooden spoons 做起。",
      "题干 out of wood 已给材料，只填复数 spoons。chairs 是 Jan 想做的东西。"
    ],
    [
      "Peter 报价含午餐 £35，若在树林露营 £40。",
      "题干明确 no camping，因此记下第一个价格 35。17 是日期，10 到 3 是活动时间。"
    ],
    [
      "Lou 说每边超过九人，就会请一些人换边。",
      "A。人数上限是每一侧 9 人。15 是游客人数，18 是游客与工作人员合计。"
    ],
    [
      "Lou 先交代船原先是黑色，再介绍现在的船。",
      "C。light-green exterior 指浅绿色外壳。深红色说的是座椅，黑色是旧船。"
    ],
    [
      "三个盒饭依次是火腿三明治、切达奶酪面包卷、含金枪鱼的沙拉。",
      "B。第 2 份不含肉或鱼。第 3 份虽然是沙拉，tuna 仍是鱼。"
    ],
    [
      "Lou 提醒船上没有垃圾桶，午餐后工作人员会来收。",
      "B。staff will collect it from you 对应把垃圾交给工作人员。大塑料袋由工作人员使用。"
    ],
    [
      "灯塔一处线索是建造前的沉船曾造成多人遇难。",
      "A。为保护船员而建，说明建造原因。1838 年是建成年份，不能推断建了多久。本双选 A、D 顺序不限。"
    ],
    [
      "另一处线索是早期守塔人多为囚犯，后来由普通家庭接替。",
      "D。守塔的是谁对应 who staffed it。擦灯、砍柴是岗位职责，没说明谁建的。本双选 A、D 顺序不限。"
    ],
    [
      "船会在毛皮海豹活动的岩石区停下，海豹可能在观众眼前浮出。",
      "B。right in front of you 对应靠近船。海鹰在远处飞，企鹅倾向躲开。本双选 B、C 顺序不限。"
    ],
    [
      "Lou 说海豚偶尔会单独或成群，沿船边的浪靠过来。",
      "C。beside us 明确说明距离。虎鲸虽在附近海岸捕猎，原文强调很难看到。本双选 B、C 顺序不限。"
    ],
    [
      "导游会在船穿过狭窄水道、看到洞口后，讲解洞内有什么。",
      "D。talk to you about what lies beyond 指解释洞口里面的情况。看到洞口并不等于会驶进去。本双选 D、E 顺序不限。"
    ],
    [
      "Lou 说明这些洞穴只能从海上接近。",
      "E。only by sea 排除了步行。也可以另一天划皮艇接近，所以 A 的「只限大型观光船」不成立。本双选 D、E 顺序不限。"
    ],
    [
      "两人开头交换寻找农场的经验。",
      "A。Diana 难以找到可申请的合适农场，Tim 也只能经熟人建立联系。交通和时长问题是 Tim 的个人经历。"
    ],
    [
      "Tim 说自己大半夜帮一只母羊产羔，生产过程不顺利。",
      "B。看到小羊站起来吃奶让他放心，小羊吃奶本身没困难。断腿是另一只小羊，由兽医处理。"
    ],
    [
      "Diana 介绍低地品种 Suffolk，Tim 问是不是为肉用而养。",
      "B。她答 mostly, yes，确认主要为肉用。其他品种是以前养过的，羊毛耐磨说的是 Tim 那边的 Cheviots。"
    ],
    [
      "两位农场主谈给鸡加维生素等补剂的时机。",
      "A。不是常规投喂，只在鸡格外需要时加。价格高低不代表效果差异，原文也没谈单次限量。"
    ],
    [
      "Diana 在挤奶棚把用过抗生素的奶牛产的奶混进了饮用奶。",
      "C。问题出在该分开存放却混入同一容器。整批奶倒掉是事后处置，不能当作她误倒牛奶。"
    ],
    [
      "Tim 的农场主说，有些小手术他可以自己做；Diana 的农场主也提过。",
      "C。quite capable of doing himself 对应由农民承担部分工作。Diana 仍认为兽医技能有用，题目并非说要取代兽医。"
    ],
    [
      "Tim 谈医疗术语时先说以为很难，再说学起来 quite straightforward。",
      "A。先设预期，再用 actually 转折，对应比想象容易。Diana 的确觉得吃力，题干只问 Tim。"
    ],
    [
      "Tim 听到宠物食品的污染检查远少于人类食品检查，觉得糟糕。",
      "E。terrible 表达震惊、不满。可抓住 diet and nutrition 后的 pet food 和 contaminated 两个定位词。"
    ],
    [
      "动物疾病模块提到骆驼、水牛等很重要，但一些疾病所知甚少。",
      "F。Diana 说科学家了解不多，Tim 也没想到防控方法了解得这么少。两个人都对研究不足作出反应。"
    ],
    [
      "谈野生动物用药时，Diana 说毕业论文也许会往这个方向写。",
      "C。write my dissertation 对应进一步研究。Tim 说喜欢这个模块，那不是题目匹配的观点。"
    ],
    [
      "讲者从 labyrinth 转到 maze，称后者为 a kind of puzzle。",
      "a kind of 对应 a type of。后面的岔道网络是谜题如何构成，空格只需填类别 puzzle。"
    ],
    [
      "讲者说走迷宫通常会先迷路几次，再 using logic 找出路径规律。",
      "using logic to work out the pattern 对应靠逻辑找到出路。pattern 是推理的对象。"
    ],
    [
      "解释 maze 的词源时，讲者提到斯堪的纳维亚词语表示 a state of confusion。",
      "a state of 对应题干 a feeling of，填 confusion。紧随的 amazing 是相关词，不是这条词源释义。"
    ],
    [
      "讲者说这类单路径迷宫长期用作冥想和祈祷的工具。",
      "meditation and prayer 与笔记并列结构吻合。calm 是可能带来的感受。"
    ],
    [
      "介绍最早的螺旋图案时，讲者说各地都有刻进石头的例子。",
      "carved into stone 对应 carvings on stone。题目只要一个词，stone 泛指材料。"
    ],
    [
      "讲者按文化介绍材料。Pima 把图案编在篮子上，古希腊用在硬币上。",
      "题干限定 Ancient Greeks，填 coins。篮子和罗马的马赛克都是邻近干扰信息。"
    ],
    [
      "英国 Saffron Walden 最大的现存草地迷宫，中间以前长着一棵大树。",
      "used to 对应 once，large 对应 big，middle 对应 centre。抓住三个同义定位后填 tree。"
    ],
    [
      "列举身心益处时，讲者说可以让呼吸变慢。",
      "slower breathing 对应 reduce the breathing rate。rate 已印在题目里，空格填 breathing。"
    ],
    [
      "医院会把供不能行走的患者使用的手指迷宫拿到床边。",
      "a paper finger labyrinth 对应 made from paper。医院地面铺的迷宫与这道题的材料无关。"
    ],
    [
      "最后举一项针对阿尔茨海默病患者的研究，提到 relief from anxiety。",
      "relief from anxiety 对应 experience less anxiety。calming 和 relaxation 也是收益，但不能和 less 搭配表达该结果。"
    ]
  ],
  [
    [
      "Jane 说图书有些从镇图书馆借，有些是个人捐的，需要人开车收取。",
      "collecting them 中 them 指 books。后面的时间灵活，对应题干 times to be arranged。"
    ],
    [
      "Jane 说借来和收到的书都有登记，需要有人帮忙更新。",
      "keep them up to date 的 them 指 records。Frank 接着问是否电脑化，进一步说明是图书记录。"
    ],
    [
      "Jane 明确说图书馆借用村礼堂的 West Room。",
      "空格后已经有 Room，只填专名 West。进门左侧只是方位说明。"
    ],
    [
      "Frank 提议 help with transport，Jane 说一直缺司机。",
      "司机去接邻村来用餐的人，所以 providing transport 对应这项志愿工作。"
    ],
    [
      "Frank 问午餐俱乐部有没有 hobby groups，尤其对 art groups 感兴趣。",
      "hobbies such as 要填具体爱好。art 是他说出的例子，Jane 会查哪里缺人。"
    ],
    [
      "Jane 说 Carroll 太太下周需要人开车送她去医院。",
      "needs a lift to the hospital 对应 taking her to hospital。Tuesday 是预约日期。"
    ],
    [
      "Jane 说已有人负责粉刷厨房，希望 Frank 到花园除草。",
      "weeding in his garden 是分给 Frank 的活。kitchen 虽也在整修计划里，但已经安排了别人。"
    ],
    [
      "Jane 报出 10 月 19 日，将在村礼堂举办 quiz。",
      "这正是表格中需要提供茶点的那一场。refreshments 是协助内容，quiz 才是活动名称。"
    ],
    [
      "11 月 18 日舞会提前售票，需要人到门口 check them。",
      "them 指 tickets。乐队和 1930 年代音乐是舞会详情，不是入场时检查的东西。"
    ],
    [
      "除夕派对改在 Mountfort Hotel，餐饮和乐队已安排。",
      "还没有的是 poster，Frank 的平面设计背景与 designing 对应。酒店名是地点栏。"
    ],
    [
      "导游说历任房主大多留下痕迹，例如加建或拆除房间。",
      "B。舞厅、温室等属于 house。农场变化不大，花坛整修只提到现任主人。"
    ],
    [
      "Sir Edward 退出政界后，在新房里接待画家、诗人等。",
      "C。creative and literary people 对应 artists and writers。富有是他的背景，政治是要逃离的生活。"
    ],
    [
      "参观者会见到志愿者穿十九世纪仆人的服装，边工作边解释。",
      "C。dressed up as servants 对应 people in costume。照片不够直观，语音导览已被替换。"
    ],
    [
      "导游列举换装和游乐场，接着介绍 latest addition。",
      "B。child-sized tractors 就是新添的 mini tractors。抓最新增加的限定，前两项早已有。"
    ],
    [
      "原乳品房打奶酪的功能被取代，如今那里可吃午餐、喝茶或咖啡。",
      "D。地点是 dairy，但题目问现在给游客的活动，应匹配 eating and drinking。"
    ],
    [
      "导游把大石楼指为 large barn，里面收藏过去用的农具。",
      "C。游客看旧工具，不是亲自使用。耕地、播种是解释旧工具以前的用途。"
    ],
    [
      "小谷仓里，孩子可以替驴和马梳理毛发。",
      "G。groom 对应帮忙照看动物。这里强调亲手照料，不是观看稀有品种。"
    ],
    [
      "马已搬出马厩，现在可以在那里买书、礼物、果酱和毛织品。",
      "A。buy 对应 shopping；原名 stables 不代表现今的用途还是养马。"
    ],
    [
      "游客在唯一的砖房 shed 外上马车，再游览庄园和农场。",
      "E。登车是旅程起点。车后来经过 parkland，不代表从 parkland 出发。"
    ],
    [
      "公园里保留了今天农场上难得一见的牛羊种类。",
      "F。hardly ever found 对应 rare breeds。提到阻止数量下降也印证保育目的。"
    ],
    [
      "Ed 认为需要写演出带给自己的情绪影响，Gemma 同意。",
      "D。emotional impact on us 对应 personal reaction。两人觉得不用重述家喻户晓的情节。本双选 D、E 不限顺序。"
    ],
    [
      "两人举了阳台戏和 Mercutio、Tybalt 打斗的例子。",
      "E。导演如何处理重要桥段，需要用具体场景说明。剧场空间可能因 800 词限制略过。本双选 D、E 不限顺序。"
    ],
    [
      "Gemma 说布景视觉上最令人印象深刻，Ed 也说布景很出色。",
      "D。两人共同认定布景是强项。Ed 看过类似构思，不能匹配「都认为原创」。"
    ],
    [
      "Gemma 觉得部分场次太暗，Ed 解释灯光有助于改变安静场次的情绪。",
      "C。Gemma 接受这个解释。helped to change the mood 对应营造合适氛围。"
    ],
    [
      "Gemma 意外看到现代装束，Ed 说本以为会更 conventional，她同意。",
      "A。conventional 对应 traditional。两人的预期是传统服装，实际采用现代设计。"
    ],
    [
      "两人认可开场乐曲和乐手，但第二、三幕音乐影响甚小。",
      "E。didn’t have much impact 和 that was a shame 表明他们都对后面的运用失望。"
    ],
    [
      "两人都说念台词有问题，Gemma 嫌太快，Ed 认为不够响。",
      "F。都同意有问题，但成因判断不同。这里并未各自提出改进方案。"
    ],
    [
      "Ed 提到青少年与父母之间总有紧张和争执，Gemma 说年轻人能共鸣。",
      "B。parents 与 teenagers 指家庭关系中的共同难题。她还把这和剧里的暴力区分开。"
    ],
    [
      "Gemma 能听懂总体情节，Ed 转而看表情并觉得结尾很有冲击力。",
      "C。powerful、intensified the emotion 都指感动。原先预期很难，并非观后评价。"
    ],
    [
      "Gemma 说作品可以在不同层次上理解，Ed 说导演可寻找新角度。",
      "C。understood on different levels 对应多种解读。角色有深度是缘由，题目没说角色容易辨认。"
    ],
    [
      "讲者引入冰岛语时，说约有 321,000 人使用。",
      "around 对应 approximately。空格后有 speakers，只填数字，带不带千位逗号均可。"
    ],
    [
      "讲者说使用者需要新词时往往自造，因此词汇一直扩充。",
      "continually increasing 对应 still growing。题干用 a，所问是一个语言的词汇系统 vocabulary。"
    ],
    [
      "讲者先举 web browser 的冰岛语名字，又举其另一个数字词汇例子。",
      "并列第二个概念是 podcast。wander 解释 browser 一词的来源，不是另一项技术。"
    ],
    [
      "讲者以 smartphones 为例，说年轻人用它读书、看剧和听音乐。",
      "such as 后要填数字设备，后面的读书玩游戏是用途。听到复数保留 smartphones。"
    ],
    [
      "英文占主导的数字环境，让孩子的 bilingual skills 很快发展。",
      "promotes their bilingual skills 和 happening really fast 对应 becoming bilingual very quickly。填形容词。"
    ],
    [
      "教师发现冰岛中学操场的对话可以从头到尾都用英语。",
      "playground conversations 对应 discussions while in the playground。题干已有 at school。"
    ],
    [
      "更小的孩子看图时，用英语说出图中内容比用冰岛语容易。",
      "say what is in a picture 对应 identify the content of a picture。图是要辨认的对象。"
    ],
    [
      "公司嫌受众小、成本不划算，讲者接着指出另一个障碍。",
      "grammar significantly more complex 对应 how complicated its grammar is。人口少已经在题干给出。"
    ],
    [
      "讲者追问失去母语会不会让年轻人 lose their sense of their own identity。",
      "题干 as Icelanders 说明是民族或文化身份，写 identity。language 是造成这种担忧的背景。"
    ],
    [
      "讲者担心孩子两门语言都没有达到 fully fluent 的程度。",
      "neither of which 对应 not ... in either。fluent in 是固定搭配，填形容词 fluent。"
    ]
  ],
  [
    [
      "Jack 说各种年龄和水平都能冲浪，一家人可以一起享受这个假期。",
      "all the family can enjoy 对应 family holidays。三岁是他孩子开始冲浪的年龄，用来说明适合一家人。"
    ],
    [
      "女士问冲浪是否需要 pretty fit，Jack 说体能好会学得更快、更不容易累。",
      "pretty 对应 quite。be 后要填描述身体状态的形容词 fit。"
    ],
    [
      "聊到 Clare 郡的 Lahinch 时，女士问有没有好的住宿，Jack 确认有些旅馆很不错。",
      "some very nice ones 中 ones 指 hotels。hostels 和 campsites 前用 basic，不能对应 good quality。"
    ],
    [
      "Jack 在 Mayo 郡推荐一处海滩的冲浪学校，并逐字母拼地名。",
      "双写 R，完整拼法 Carrowniskey。Lahinch 是前一个地点，题干已经给 beach。"
    ],
    [
      "Jack 说孩子的夏令营每天三小时，持续一周。",
      "题目问整个营期，填 week。三小时是每天时长，10–16 是适龄范围。"
    ],
    [
      "孩子冲浪时，大人租皮艇去看看附近的海湾。",
      "rent kayaks to have a look around 与 explore by kayak 对应。空格填地形 bay。"
    ],
    [
      "Jack 先说八月比春秋更容易下雨，再说自己最喜欢九月，因为水更暖。",
      "favourite month 对应 best month。孩子开学是女士另提的限制。"
    ],
    [
      "谈爱尔兰夏季气温时，Jack 区分了平均温度与通常上限。",
      "about 19 degrees 是平均值。25 度是通常不会超过的温度。"
    ],
    [
      "Jack 说冲浪服和板合租，每天约 30 欧元。",
      "daily rate 对应 per day。40 欧元是按周租预计能省下的钱。"
    ],
    [
      "除了冲浪服，Jack 特意提醒也要租靴子。",
      "keep your feet warm 对应 for warmth。题干已列 wetsuit and surfboard，第三件装备是 boots。"
    ],
    [
      "下午通常 50–60 人，早餐时段约为该人数的一半。",
      "B。比较早晚两场可知放学后人数更多；50–60 并非上午平均。本双选 B、E 不限顺序。"
    ],
    [
      "负责人说保险允许服务最多 70 名儿童。",
      "E。up to 70 对应 maximum。虽也有 70 人注册，但单场通常未满；服务已开展十年。本双选 B、E 不限顺序。"
    ],
    [
      "先听 3:30 到 6 点整个下午的定价，再听一小时和两小时价格。",
      "C。全场 £7.20。一小时 £3.50，两小时 £5.70，题干限定 complete。"
    ],
    [
      "放学后先发健康小吃，下午 5 点给意面、炖菜等更实在的食物。",
      "C。something more substantial 对应 proper meal。小吃由托管方提供，过敏可改发合适的替代食品。"
    ],
    [
      "假期部分本校孩子不会来，腾出的名额可让其他学校的孩子参加。",
      "A。other schools 是假期变化。保险仍不允许超过 11 岁的孩子来，没说人数上限调高。"
    ],
    [
      "西班牙语分大龄和低龄两场，负责人说它是唯一额外收费的活动。",
      "E。extra charge 对应 additional fee。虽然有 over 8s 场，但还有低龄场。"
    ],
    [
      "教歌唱和打击乐的员工需要家长协助，负责人邀请会唱歌或乐器的家长。",
      "D。rely on parental support 对应 requires help from parents。"
    ],
    [
      "机构本来怕弄脏不愿开绘画课，孩子不断要求才同意。",
      "G。children kept asking 直接对应 was requested by children。"
    ],
    [
      "很早就想做瑜伽，直到现在才找到能来教的人。",
      "F。until now 和接下来看效果都说明刚开始。找不到老师是过去的状态。"
    ],
    [
      "小孩子喜欢烹饪，但场地太乱，于是团队决定限制参加年龄。",
      "C。restrict this to the over 8s 对应只限 8 岁以上。限制来自清理能力。"
    ],
    [
      "Holly 说选体育场实习是因为 fresh air，室内项目虽好玩却没那么吸引她。",
      "B。fresh air 对应 outdoors。小学儿童是项目对象，fun 用在她未选的室内项目上。"
    ],
    [
      "导师说明器材归学校负责，她负责场地和里面的人。",
      "A。main priority 是不能让人走失，也就是把孩子留在边界内。检查更衣室是附带职责。"
    ],
    [
      "导师不建议依赖家长当志愿者，他们多半忙着拍孩子。",
      "A。需要请他们挪位又不容易，对应观众难管理。导师并未禁止拍照。"
    ],
    [
      "讲到赛程变动，Holly 提到去年有人受伤，造成严重延误。",
      "B。题干问过去实际发生的情况。下雨至今幸运地避开了，加时是设想。"
    ],
    [
      "导师说沟通不只在于说什么，举面对面争取赞助的例子。",
      "C。Holly 接话要 dress up，导师认可，说明仪表得体也属于沟通。"
    ],
    [
      "两人讨论组织活动时会遇到突发状况，需要临场改日程。",
      "A。prepared to make changes 和 on-the-spot change 对应灵活应变。"
    ],
    [
      "Holly 说临近截止时间，即便慌乱也得显得平静。",
      "D。导师也说别让别人察觉压力，所以是隐藏情绪。多任务只是她手头的状态。"
    ],
    [
      "客户提出整体想法，活动经理得想清楚让它落地的小细节。",
      "B。fine points 与 fill in the gaps 都指落实细节。识别 big picture 与执行细节的分工。"
    ],
    [
      "导师说团队可提建议，但负责人要承担最终责任、作出最后选择。",
      "F。believe in what you think best 对应信任自己的判断。听意见并不等于把决定交出去。"
    ],
    [
      "导师说多认识人、多留下好印象，Holly 说有助于以后找工作。",
      "H。think ahead、ambitions 明确指未来。缺少经验是当前顾虑。"
    ],
    [
      "讲者介绍冬眠旧说，一种认为鸟在水里，另一种认为藏在泥中。",
      "hidden in mud 对应 buried themselves in mud。题干已给水下这一项。"
    ],
    [
      "亚里士多德观察到红尾鸲秋天开始掉羽毛，由此误推它变成知更鸟。",
      "lose their feathers 对应 the loss of feathers。错误是物种转化推论，掉羽毛是他观察到的。"
    ],
    [
      "讲者觉得这个推论可以理解，因为两类鸟外形相似。",
      "similar in shape 改写成 had a similar shape。相似只解释猜测为何产生。"
    ],
    [
      "17 世纪 Morton 的论文称鸟每年飞往月球再回来。",
      "题干已给 to the，填 moon。这是历史上的理论，不是现代事实。"
    ],
    [
      "1822 年德国白鹳身上有一支来自中非的长矛。",
      "题干问长矛扎在哪个部位，原文给 neck。长矛的产地用于推断迁徙。"
    ],
    [
      "带矛白鹳是首个指向鹳去非洲越冬的证据。",
      "first evidence 对应此前没有 evidence。找得到这只鸟的博物馆不是题目所问。"
    ],
    [
      "给鸟佩戴脚环以前，研究者对具体目的地及旅程了解很少。",
      "actual destinations 与 how they travelled there 对应题干的两个并列信息。空格为 destinations。"
    ],
    [
      "过去有人觉得小鸟太轻，不可能自己跨越辽阔海洋。",
      "vast oceans 对应 huge oceans。大鸟载小鸟是这个误解衍生出的猜测。"
    ],
    [
      "讲者解释到达地发现已佩环的死鸟、再辨认身份的过程。",
      "术语是 recovery。题干的引号提示要写这个特定术语，而不是一般动作 identification。"
    ],
    [
      "1931 年出版的资料汇集了欧洲常见鸟类的迁徙地点。",
      "published 与 printed 呼应，这份带地理信息的出版物叫 atlas。时间锁定它。"
    ]
  ],
  [
    [
      "客户说没有地毯，但地板要清洁；Jacinta 确认每间房都会做。",
      "every room 对应 throughout the apartment。floor 或 floors 都接受，carpets 被否定。"
    ],
    [
      "Jacinta 先提出每周清洁烤箱，客户说很少使用，改问冰箱。",
      "双方确认每周洗 fridge。题干问 agreed，烤箱只是最初提出的项目。"
    ],
    [
      "客户说工作穿的衬衫才需要熨，数量不会多。",
      "just 对应 only。clothes 已在题干里，填具体衣物 shirts。微波炉随后被拒绝。"
    ],
    [
      "谈月度服务时，Jacinta 提出洗窗的内侧，客户同意。",
      "from the inside 对应 inside of your windows。外侧由高层专业人员负责。"
    ],
    [
      "客户说窗帘不用清洁，但阳台大概每月需要冲洗一次。",
      "a wash 对应 washing down。pressure washer 是冲洗阳台用的设备，不是清理对象。"
    ],
    [
      "公司既能介绍可靠的水管工，也能用同样方式帮忙找电工。",
      "the same thing 承接 put you in touch with。题干是 plumber or an，填 electrician。"
    ],
    [
      "特制吸尘系统能捕捉空气中约 99% 的灰尘，可帮到有过敏困扰的人。",
      "allergic to 后填引发过敏的物质 dust。客户自己没有这个问题，不影响服务内容。"
    ],
    [
      "清洁员申请时必须与警方进行安全审查，核实有无犯罪背景。",
      "security check 对应 background check。负责审查的是 police，references 是另一项材料。"
    ],
    [
      "公司认为申请人合适后，就给他们为期两周的培训。",
      "That lasts for two weeks 的 that 指 training。结束后才参加 test。"
    ],
    [
      "公司要求客户每次服务后写一份表现评价，再用邮件发回。",
      "complete a review 与 email it 对应 send a review。题干问发送的内容，不是媒介。"
    ],
    [
      "讲者先列经理以为的主因低薪和工时长，再用 but 转折。",
      "A。what they don't realise 引出题干 unaware，真正容易被忽略的是培训缺乏。"
    ],
    [
      "经理得不断招聘，并在新人来之前顶替部分岗位。",
      "A。招聘很耗时又得代班，所以工作量增加。后面说情绪受影响的是留下来的员工。"
    ],
    [
      "排班时不要优待某些员工，每个人既有选择也应分担晚班和周末班。",
      "A。preferential treatment 对应不能区别对待。例子虽跟排班有关，但没说改变前通知。"
    ],
    [
      "Dunwich 本来为处理员工投诉而改善条件，意外看到客人多消费。",
      "C。each customer spent 对应 spending per customer。下降的是原有投诉，顾客忠诚计划是后来推出的。"
    ],
    [
      "Sun Club 过去让员工感觉意见不受重视，后来请初级员工参加会议提想法。",
      "A。参与决策、像伙伴一样合作，对应改善关系和团队协作。"
    ],
    [
      "Portland 先辨认有潜力的人，再给具备管理潜质的员工做培训。",
      "C。培训指向管理岗位的发展。recognising talent 在这里不是资金奖励。"
    ],
    [
      "Bluewater 从连锁酒店选出 50 名表现突出的人，奖励全额付费国外旅行。",
      "B。reward 和 all-expenses-paid 对应激励和经济福利。参观啤酒厂学习是行程内容。"
    ],
    [
      "Pentlow 为前台初级员工引入管理培训项目，让他们承担职责、轮换岗位。",
      "C。good prospects、various roles 对应发展机会。题目没说为这些岗位加薪。"
    ],
    [
      "Green Planet 给有育儿负担的员工发代金券，帮助支付托育费用。",
      "B。vouchers to cover the cost 直接属于经济福利。关心员工是发券动机。"
    ],
    [
      "Amesbury 的 Louise 营造互相配合和支持的环境，把员工视作大家庭。",
      "A。co-operative and supportive 对应团队关系，而非升职或金钱奖励。"
    ],
    [
      "Thomas 回顾校队经历，说父母或许该督促得更紧，自己应该多练。",
      "C。should have practised more 对应本来可以更努力。原文没说父母失望。本双选 C、E 不限顺序。"
    ],
    [
      "同学都相信 Thomas 会当职业运动员，觉得他非常出色。",
      "E。thought I was brilliant 表明同龄人钦佩他。题干限定在校经历。本双选 C、E 不限顺序。"
    ],
    [
      "在肯尼亚与顶尖选手比过后，习惯获胜的 Thomas 不肯相信自己不够强。",
      "A。this can't be happening 表达难以置信。注意这是比赛开始后的反应。本双选 A、D 不限顺序。"
    ],
    [
      "去肯尼亚与优秀少年运动员同训时，Thomas 觉得自己很幸运。",
      "D。fortunate 和 great chance 表达对机会的感激。原文说他当时很平静，并非紧张。本双选 A、D 不限顺序。"
    ],
    [
      "乒乓球拍的颗粒橡胶原先由工厂成卷量产，用于马具之类。",
      "B。in bulk 和 horse harnesses 对应为其他用途量产，后来才改用于球拍。"
    ],
    [
      "早期板球头盔造型太丑，第一位戴它的击球手被观众起哄。",
      "F。booed and jeered by people watching 表明观众不喜欢，和运动员自己是否喜欢无关。"
    ],
    [
      "早期自行车头盔戴着运动会把头发汗湿，现代版后来增加透气孔。",
      "A。wet hair from hard exercise 对应出汗过多。图里还有佩戴者自豪，并非人人不喜欢。"
    ],
    [
      "过去全木制的高尔夫球杆容易断，球手常得再买一支。",
      "D。easily break 与 get another 对应频繁更换。现在球杆更有力是附带说明。"
    ],
    [
      "曲棍球刚开始流行时，球手要自己做球杆。",
      "C。produce a stick yourself 对应 make their own。当时没现成制造，今天仍有人用木球杆。"
    ],
    [
      "早期缝制皮足球雨天进水变重，顶球时可能伤颈部。",
      "G。damage to players' necks 对应造成伤害。球变重是受伤的原因。"
    ],
    [
      "讲者形容枫糖浆是黏稠、金色、甜的液体。",
      "题目只问 colour，写 golden。clear honey 是外形比喻，sweet 是味道。"
    ],
    [
      "枫糖浆不含防腐剂和其他添加物，被称为精制糖的健康替代品。",
      "healthy alternative to refined sugar 对应 compared to refined sugar。空格为形容词 healthy。"
    ],
    [
      "介绍树木所需的水分、白天阳光和凉爽夜晚后，讲者指出当地的总体条件。",
      "the climate suits the trees 对应 Canada 和北美的气候适宜。题干已概括生长条件。"
    ],
    [
      "早期生产者把晒得很烫的石块放进汁液，使其煮沸。",
      "pieces of rock 对应题干 hot rock 或 rocks。树皮是收集容器的材料，不负责加热。"
    ],
    [
      "树干直径达到约 25 厘米才可取汁，这可能要长 40 年。",
      "reach a diameter 对应 have the correct diameter。题干问所需尺寸的类型，只填 diameter。"
    ],
    [
      "在树干钻孔后，工人插入延伸到桶中的管子。",
      "插入物 tube 负责输送树汁。tap 是取汁步骤或出汁口，bucket 是终点。"
    ],
    [
      "树汁倒进 evaporator 大锅后，生火加热到沸腾。",
      "a fire is built 对应 heated by means of a fire。题干已给锅名。"
    ],
    [
      "蒸发过程产生大量水蒸气，汁液越来越浓稠。",
      "large quantities of steam 对应 a lot of steam。足够稠是留下的汁液状态。"
    ],
    [
      "煮制时积起的 sugar sand 会让糖浆看上去混浊，口感略带颗粒。",
      "a cloudy appearance 对应 look cloudy。gritty 是口感，不是空格要填的外观。"
    ],
    [
      "讲者结尾说明约 40 升树汁才做得出一升糖浆。",
      "题干问成品糖浆的单位，a 后用单数 litre 或美式 liter。40 是所需树汁数量。"
    ]
  ]
];
