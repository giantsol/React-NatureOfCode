import {Socket} from "socket.io"
import {ServerModels} from "./ServerModels"

export interface ServerSocket extends Socket {
    player: ServerModels.Player;
}