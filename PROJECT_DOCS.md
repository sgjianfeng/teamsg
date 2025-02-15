# VisionSG 项目文档

## 项目概述
VisionSG是一个创新的新加坡愿景匹配平台（Singapore Vision Platform），旨在连接有梦想的个人与能够实现这些梦想的团队。平台采用先进的AI技术和vision transformer来实现精准匹配，帮助用户将愿景转化为现实。项目采用响应式设计，确保在desktop、tablet和mobile设备上都能提供良好的用户体验。

### 核心理念
- 连接梦想：帮助个人找到能够支持实现其愿景的团队
- 资源整合：汇集各类团队、机构、公司的专业资源
- 协同创新：通过AI技术和团队协作，将愿景转化为现实

## 技术栈
- **前端框架**: React + Vite
- **后端服务**: Supabase
- **样式方案**: CSS Modules
- **状态管理**: React Context API
- **认证服务**: Supabase Auth

## 项目结构
```
src/
├── components/        # 可重用组件
│   ├── desktop/      # 桌面端组件
│   ├── mobile/       # 移动端组件
│   └── tablet/       # 平板端组件
├── contexts/         # React Context管理
├── layouts/          # 布局组件
├── pages/           # 页面组件
├── utils/           # 工具函数
└── assets/          # 静态资源
```

## 核心特性

### 1. Vision提交与匹配系统
- 用户友好的vision输入界面
  - 文本描述输入
  - 图片上传支持
  - 关键词标签系统
- Vision Transformer匹配引擎
  - 基于AI的关键词提取
  - 智能团队匹配算法
  - 实时匹配结果展示
- 团队选择与提交流程
  - 灵活的团队筛选
  - 一键提交功能
  - 自动加入相关groups

### 2. 团队管理系统
- 团队创建和管理
  - 完整的团队信息设置
  - 多样化的group类型
  - 资源和工具管理
- Vision Transformer Group
  - 关键词管理
  - 成员交流系统
  - 资源分配tracking
- 项目协作空间
  - 实时沟通工具
  - 文件共享系统
  - 进度追踪

### 3. AI辅助系统
- 智能匹配引擎
  - 自然语言处理
  - 图像识别分析
  - 上下文理解
- 资源推荐系统
  - 工具智能推荐
  - 专家匹配
  - 相关项目推荐

### 4. 响应式设计
- 采用设备特定组件approach（desktop/tablet/mobile）
- 使用`deviceDetect.js`进行设备检测
- 为不同设备提供优化的用户界面和交互体验

### 5. 认证系统
- 基于Supabase Auth的用户认证
- 支持邮箱密码注册登录
- 用户会话管理
- 受保护路由实现

### 6. 布局系统
- 设备特定的布局组件
- 可复用的导航组件
- 一致的页面结构

## 数据模型

### 用户相关
```sql
profiles (
  id uuid references auth.users,
  username text,
  avatar_url text,
  updated_at timestamp
)

visions (
  id uuid primary key,
  user_id uuid references auth.users,
  title text,
  description text,
  images json[],
  keywords text[],
  created_at timestamp,
  status text
)

teams (
  id uuid primary key,
  name text,
  description text,
  logo_url text,
  created_at timestamp
)

groups (
  id uuid primary key,
  team_id uuid references teams,
  name text,
  type text,
  description text,
  keywords text[]
)

group_members (
  group_id uuid references groups,
  user_id uuid references auth.users,
  role text,
  joined_at timestamp
)

vision_matches (
  vision_id uuid references visions,
  team_id uuid references teams,
  status text,
  matched_at timestamp
)
```

## API集成
使用Supabase提供的服务：
- 认证服务（Auth）
- 数据存储（Database）
- 实时订阅（Realtime）
- 文件存储（Storage）

AI服务集成：
- Vision Transformer API
- 自然语言处理服务
- 图像分析服务

## 开发规范

### 组件开发规范
1. 组件应遵循单一职责原则
2. 使用prop-types或TypeScript进行类型检查
3. 遵循React Hooks的使用规则
4. 保持组件的纯函数特性

### 样式规范
1. 使用CSS Modules避免样式冲突
2. 遵循BEM命名约定
3. 使用变量管理主题色和常用值

### 代码规范
1. 使用ESLint进行代码检查
2. 使用Prettier保持代码格式统一
3. 遵循函数式编程原则
4. 编写清晰的注释和文档

## 部署流程
1. 代码提交到GitHub仓库
2. 自动化测试（待实现）
3. 构建优化
   - 代码分割
   - 资源优化
   - 缓存策略

## 功能实现路线图

### Phase 1: 基础平台搭建
1. 用户认证系统
2. Vision提交功能
3. 基础团队管理
4. 简单关键词匹配

### Phase 2: 核心功能增强
1. Vision Transformer实现
2. AI匹配引擎开发
3. 团队协作工具集成
4. 实时通讯系统

### Phase 3: 智能化升级
1. AI助手功能
2. 智能资源推荐
3. 项目进度预测
4. 自动化报告生成

### Phase 4: 生态系统建设
1. 开放API接口
2. 第三方工具集成
3. 数据分析平台
4. 社区建设

## 未来规划
1. 建立完整的Singapore Vision生态系统
2. 集成更多AI能力
3. 扩展国际化支持
4. 建立创新项目评估体系
5. 实现跨平台集成

## 开发环境设置
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

## 环境变量配置
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 常见问题解决方案
1. 认证相关问题处理
2. 跨设备兼容性处理
3. 性能优化建议
4. 数据同步策略

## 项目维护
1. 定期更新依赖
2. 监控性能指标
3. 代码审查流程
4. 文档更新

## 贡献指南
1. Fork项目
2. 创建特性分支
3. 提交更改
4. 发起Pull Request

## 联系方式
项目维护者联系方式（待补充）
