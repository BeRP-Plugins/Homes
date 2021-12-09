import { PluginApi } from './@interface/pluginApi.i'
import path from "path"
import fs from 'fs'
import { OPEN_READWRITE, Database, OPEN_CREATE } from 'sqlite3'

class databaseManager {
  private api: PluginApi
  private db: Database
  private Path: string

  constructor(api: PluginApi) {
    this.api = api
    this.Path = `/plugins/Homes/src/main.db`
  }

  public async onEnabled(): Promise<void> {
    await this.dbCheck()
    await this.dbMount()
  }

  public async onDisabled(): Promise<void> {
    this.db.close()
  }

  private async dbCheck() {
    return new Promise((res) => {
      if (fs.existsSync(path.resolve(process.cwd() + this.Path))) return res(true)
      this.api.getLogger().warn('Database not found! Creating database...')
      new Database(path.resolve(process.cwd() + this.Path), OPEN_READWRITE | OPEN_CREATE, err => {
        if (err) return this.api.getLogger().error(err)
        this.api.getLogger().success('main.db made successfully!')

        return res(true)
      })
  
      return res(true)
    })
  }

  private async dbMount() {
    return new Promise((res) => {
      this.db = new Database(path.resolve(process.cwd() + this.Path), OPEN_READWRITE | OPEN_CREATE, err => {
        if (err) return this.api.getLogger().error(err)
        this.api.getLogger().success('main.db mounted successfully!')
        this.db.run(`CREATE TABLE IF NOT EXISTS homes(name TEXT, coords TEXT)`, (err) => {
          if (err) return this.api.getLogger().error(err)
        })

        return res(true)
      })
  
      return res(true)
    })
  }

  async sethome(player: string, coords: string): Promise<boolean | any> {
    return new Promise((res) => {
      this.db = new Database(path.resolve(process.cwd() + this.Path), OPEN_READWRITE | OPEN_CREATE, err => {
        if (err) return this.api.getLogger().error(err)
        //get if player exist in database
        this.db.get(`SELECT EXISTS(SELECT 1 FROM homes WHERE name = "${player}")`, (err, result) => {
          if (err) return this.api.getLogger().error(err)
          const property = `EXISTS(SELECT 1 FROM homes WHERE name = "${player}")`
          const exist = result[property]
          //console.log(exist)
          // if exist = 0 new sethome | 1 update sethome
          if (exist == 0) {
            this.db.run(`INSERT INTO homes VALUES("${player}", "${coords}")`, (err) => {
              if (err) return this.api.getLogger().error(err)
            })
          } else {
            this.db.run(`UPDATE homes SET coords = "${coords}" WHERE name = "${player}"`, (err) => {
              if (err) return this.api.getLogger().error(err)
            })
          }
        })

        return res(true)
      })
  
      return res(true)
    })
  }

  async home(player: string): Promise<boolean | any> {
    return new Promise((res) => {
      this.db = new Database(path.resolve(process.cwd() + this.Path), OPEN_READWRITE | OPEN_CREATE, err => {
        if (err) return this.api.getLogger().error(err)
        this.db.get(`SELECT * FROM homes WHERE name = "${player}"`, (err, result) => {
          if (err) return this.api.getLogger().error(err)
          //console.log(result)
          this.api.getCommandManager().executeCommand(`execute ${player} ~~~ tp @s ${result['coords']}`)
        })

        return res(true)
      })

      return res(true)
    })
  }
}

export = databaseManager
