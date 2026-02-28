const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(helmet());
app.use(cors());
app.use(express.json());
// 正确处理URL编码，防止中文字符损坏
app.use(express.urlencoded({ extended: true }));

// 模拟数据 - 影视内容
const moviesData = {
  "站名": "天微影视",
  "主页url": "https://tianwei.com",
  "请求头参数": {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
  },
  "分类": "电影$movie#电视剧$tv#综艺$variety#动漫$anime#纪录片$documentary",
  "数组": "<div class=\"module-item\">&&</div>",
  "图片": "data-src=\"&&\"",
  "标题": "title=\"&&\"",
  "链接": "href=\"&&\"",
  "副标题": "class=\"module-item-note\">&&</div>",
  "搜索url": "/search?keyword={wd}",
  "搜索数组": "<div class=\"module-search-item\">&&</div>",
  "搜索图片": "data-src=\"&&\"",
  "搜索标题": "alt=\"&&\"",
  "搜索链接": "href=\"&&\"",
  "播放数组": "<div class=\"scroll-content\">&&</div>",
  "播放列表": "<a&&</a>",
  "播放标题": "</i>&&</a>",
  "播放链接": "href=\"&&\""
};

// 推荐内容 - 首页展示
const recommendContent = [
  {
    "vod_id": 1,
    "vod_name": "流浪地球2",
    "vod_pic": "https://img.example.com/liulangdiqiu2.jpg",
    "vod_remarks": "科幻巨制",
    "vod_year": "2023",
    "vod_area": "中国大陆",
    "vod_actor": "吴京,刘德华,李雪健",
    "vod_director": "郭帆",
    "vod_content": "太阳即将毁灭，人类在地球表面建造出巨大的推进器，寻找新的家园。"
  },
  {
    "vod_id": 2,
    "vod_name": "满江红",
    "vod_pic": "https://img.example.com/manjianghong.jpg",
    "vod_remarks": "古装悬疑",
    "vod_year": "2023",
    "vod_area": "中国大陆",
    "vod_actor": "沈腾,易烊千玺,张译",
    "vod_director": "张艺谋",
    "vod_content": "南宋绍兴年间，岳飞死后四年，秦桧率兵与金国会谈。会谈前夜，金国使者死在了宰相驻地。"
  },
  {
    "vod_id": 3,
    "vod_name": "中国医生",
    "vod_pic": "https://img.example.com/zhongguoyisheng.jpg",
    "vod_remarks": "抗疫题材",
    "vod_year": "2021",
    "vod_area": "中国大陆",
    "vod_actor": "张涵予,袁泉,朱亚文",
    "vod_director": "刘伟强",
    "vod_content": "以武汉市金银潭医院为核心故事背景，再现了抗新冠疫情期间一线医护人员无私奉献的故事。"
  }
];

// 分类数据
const categories = {
  movie: {
    name: "电影",
    items: [
      {
        "vod_id": 101,
        "vod_name": "阿凡达：水之道",
        "vod_pic": "https://img.example.com/avatar-water-way.jpg",
        "vod_remarks": "动作冒险"
      },
      {
        "vod_id": 102,
        "vod_name": "蚁人与黄蜂女：量子狂潮",
        "vod_pic": "https://img.example.com/antman-quantum.jpg",
        "vod_remarks": "超级英雄"
      }
    ]
  },
  tv: {
    name: "电视剧",
    items: [
      {
        "vod_id": 201,
        "vod_name": "三体",
        "vod_pic": "https://img.example.com/santi.jpg",
        "vod_remarks": "科幻大作"
      },
      {
        "vod_id": 202,
        "vod_name": "去有风的地方",
        "vod_pic": "https://img.example.com/fengdeplace.jpg",
        "vod_remarks": "田园治愈"
      }
    ]
  },
  variety: {
    name: "综艺",
    items: [
      {
        "vod_id": 301,
        "vod_name": "王牌对王牌",
        "vod_pic": "https://img.example.com/wangpaiduicaifu.jpg",
        "vod_remarks": "第8季"
      },
      {
        "vod_id": 302,
        "vod_name": "快乐再出发",
        "vod_pic": "https://img.example.com/kuailezaikaifang.jpg",
        "vod_remarks": "第2季"
      }
    ]
  },
  anime: {
    name: "动漫",
    items: [
      {
        "vod_id": 401,
        "vod_name": "斗罗大陆",
        "vod_pic": "https://img.example.com/douluodaluf.jpg",
        "vod_remarks": "更新至237集"
      },
      {
        "vod_id": 402,
        "vod_name": "完美世界",
        "vod_pic": "https://img.example.com/wanmeishijie.jpg",
        "vod_remarks": "更新至165集"
      }
    ]
  },
  documentary: {
    name: "纪录片",
    items: [
      {
        "vod_id": 501,
        "vod_name": "航拍中国",
        "vod_pic": "https://img.example.com/hangpaizhongguo.jpg",
        "vod_remarks": "第四季"
      },
      {
        "vod_id": 502,
        "vod_name": "河西走廊",
        "vod_pic": "https://img.example.com/hexizoulang.jpg",
        "vod_remarks": "历史记录片"
      }
    ]
  }
};

// 主要API端点 - 返回配置信息
app.get('/api/config', (req, res) => {
  res.json(moviesData);
});

// 获取推荐内容
app.get('/api/recommend', (req, res) => {
  res.json({
    code: 200,
    msg: "success",
    data: recommendContent
  });
});

// 根据类型获取内容
app.get('/api/type/:type', (req, res) => {
  const { type } = req.params;
  
  if (categories[type]) {
    res.json({
      code: 200,
      msg: "success",
      data: categories[type].items
    });
  } else {
    res.status(404).json({
      code: 404,
      msg: "类型不存在",
      data: []
    });
  }
});

// 获取特定视频详情
app.get('/api/detail/:id', (req, res) => {
  const { id } = req.params;
  
  // 在实际应用中，这里会查询数据库
  // 这里简化处理，只返回示例数据
  let videoDetail = null;
  
  // 查找所有类别中的视频
  for (let category in categories) {
    const found = categories[category].items.find(item => item.vod_id == id);
    if (found) {
      videoDetail = found;
      break;
    }
  }
  
  // 如果没找到，则查找推荐内容
  if (!videoDetail) {
    videoDetail = recommendContent.find(item => item.vod_id == id);
  }
  
  if (videoDetail) {
    res.json({
      code: 200,
      msg: "success",
      data: videoDetail
    });
  } else {
    res.status(404).json({
      code: 404,
      msg: "视频未找到",
      data: {}
    });
  }
});

// 搜索功能
app.get('/api/search', (req, res) => {
  let keyword = req.query.keyword || '';
  
  // 更强大的编码处理 - 处理URL参数中可能出现的各种编码问题
  if (typeof Buffer !== 'undefined' && keyword) {
    try {
      // 检测是否为乱码（常见的是UTF-8被按Latin-1解析的情况）
      if (/[\-\ÿ]/.test(keyword)) {
        // 可能是UTF-8字节被当作Latin-1解析，重新解码
        keyword = decodeURIComponent(escape(keyword));
      }
      
      // 再次检查是否有乱码符号，并尝试用Buffer方式修复
      if (/[^\x00-\x7F]/.test(keyword) && !/^[一-龥\s\w]+$/.test(keyword)) {
        // 假设输入是错误解码的字符串，尝试重建
        keyword = Buffer.from(keyword, 'latin1').toString('utf8');
      }
    } catch (e) {
      console.warn('编码转换失败:', e.message);
    }
  }
    
  if (keyword.trim() === '') {
    return res.status(400).json({
      code: 400,
      msg: "关键词不能为空",
      data: []
    });
  }
  
// 简单的模糊匹配
const allVideos = [
  ...recommendContent,
  ...Object.values(categories).flatMap(category => category.items)
];
  
// 改进的模糊匹配：支持关键词分割和多字段匹配
const keywords = keyword.toLowerCase().split(/\s+/).filter(k => k.length > 0);
  
console.log('搜索关键词:', keyword); // 调试日志
console.log('解析出的关键词:', keywords); // 调试日志
console.log('视频总数:', allVideos.length); // 调试日志
  
const searchResults = allVideos.filter(video => {
  const title = (video.vod_name || '').toLowerCase();
  const actor = (video.vod_actor || '').toLowerCase();
  const director = (video.vod_director || '').toLowerCase();
  const content = (video.vod_content || '').toLowerCase();
    
  console.log(`检查视频 "${title}" 是否包含关键词`); // 调试日志
    
  // 检查标题、演员、导演或简介中是否包含任意关键词（而非全部）
  const match = keywords.some(kw => 
    title.includes(kw) || actor.includes(kw) || director.includes(kw) || content.includes(kw)
  );
    
  console.log(`  - 匹配结果: ${match}`); // 调试日志
  return match;
});
  
console.log('搜索结果数量:', searchResults.length); // 调试日志
  
res.json({
  code: 200,
  msg: "success",
  data: searchResults
});
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    code: 500,
    msg: "服务器内部错误",
    data: {}
  });
});

// 404 处理 - 使用正确的路由语法
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    msg: "接口不存在",
    data: {}
  });
});

app.listen(PORT, () => {
  console.log(`天微影视API服务运行在端口 ${PORT}`);
  console.log(`访问 http://localhost:${PORT}/api/config 获取配置`);
  console.log(`访问 http://localhost:${PORT}/api/recommend 获取推荐内容`);
});

module.exports = app;