import {ClientModels} from "../client/ClientModels"

const uuid = require("uuid");

export namespace ServerModels {

    export class Player {
        name: string;
        id: string;

        constructor(name: string, id: string) {
            this.name = name
            this.id = id
        }

        static createFrom(clientPlayer: ClientModels.Player): Player {
            return new Player(clientPlayer.name, uuid())
        }
    }

}