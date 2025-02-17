import { TeamModel } from './team'
import { GroupModel } from './group'
import { MemberModel } from './member'
import { MessageModel } from './message'
import { UserModel } from './user'

export {
  TeamModel,
  GroupModel,
  MemberModel,
  MessageModel,
  UserModel
}

// 初始化数据库表
import { createTeamsTable } from '../migrations/01_create_teams'

// 当应用启动时检查并创建必要的表
createTeamsTable()
  .then(() => console.log('Database initialization completed'))
  .catch(console.error)
