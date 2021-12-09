/* eslint-disable @typescript-eslint/no-var-requires */
import { PluginApi } from './@interface/pluginApi.i'
import databaseManager from './databaseManager'
import fs from 'fs'
import path from 'path'

class Homes {
    private api: PluginApi
    private databaseManager: databaseManager

    constructor(api: PluginApi) {
      this.api = api
      this.databaseManager = new databaseManager(this.api)
    }

    public async onLoaded(): Promise<void> {
      this.api.getLogger().info('Plugin loaded!')
      await this.databaseManager.onEnabled()
    }

    public async onEnabled(): Promise<void> {
      this.api.getLogger().info('Plugin enabled!')

      this.api.getCommandManager().setPrefix('.')
      this.api.getCommandManager().registerCommand({
        command: "sethome",
        description: 'set home location',
        aliases: [''],
      }, (res) => {
        const username = res.sender.getName()
        const user = res.sender

        // get location by beAPI socket form 
        // res.sender.getLocation().then((loc) => {
        //   console.log(loc)

        // })

        this.api.getCommandManager().executeCommand(`execute ${username} ~~~ tp @s ~~~`, (res) => {
          //console.log(res.output[0].paramaters)
          const x = res.output[0].paramaters[1]
          const y = res.output[0].paramaters[2]
          const z = res.output[0].paramaters[3]
          const xyz = `${x} ${y} ${z}`
          try {
            this.databaseManager.sethome(username, xyz)
            user.sendMessage("§aHome location set successfully!")
          } catch(e) {
            console.log(e)
          }
        })
      })

      this.api.getCommandManager().registerCommand({
        command: "home",
        description: 'tp home',
        aliases: [''],
      }, (res) => {
        try {
          this.databaseManager.home(res.sender.getName())
          res.sender.sendMessage("§aTeleported to home location!")
        } catch(e) {
          console.log(e)
        }
      })
    }
    public onDisabled(): void {
      this.api.getLogger().info('Plugin disabled!')
    }
}

export = Homes
