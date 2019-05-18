import {ServerModels} from "../server/ServerModels"

export namespace ClientModels {
    export class Player {
        name: string;

        constructor(name: string) {
            this.name = name
        }

        static createFrom(serverPlayer: ServerModels.Player): Player {
            return new Player(serverPlayer.name)
        }
    }
}