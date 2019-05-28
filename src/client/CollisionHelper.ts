import {CollidingObject} from "../server/ServerModels"
import Utils from "../shared/Utils"

export default class CollisionHelper {

    checkCollision(me: CollidingObject, othersArray: CollidingObject[][],
                   isCollisionTarget: (other: CollidingObject) => boolean,
                   processCollision: (other: CollidingObject) => void): void {
        for (let objects of othersArray) {
            if (objects.length == 0) {
                continue
            }

            // first, sort objects by closest order
            const myX = me.x
            const myY = me.y
            objects.sort((a: CollidingObject, b: CollidingObject) => {
                return Utils.distance(myX, myY, a.x, a.y) - Utils.distance(myX, myY, b.x, b.y)
            })

            for (let object of objects) {
                if (isCollisionTarget(object)) {
                    // check if it's too far that it's not worth checking line intersection
                    const dist = Utils.distance(myX, myY, object.x, object.y)
                    if (dist > me.maxSize + object.maxSize) {
                        break
                    }

                    // now check line intersection
                    const myVertices = me.vertices
                    const otherVertices = object.vertices
                    const otherX = object.x
                    const otherY = object.y
                    for (let i = 0; i < myVertices.length - 1; i++) {
                        for (let j = 0; j < otherVertices.length - 1; j++) {
                            const mv1 = myVertices[i]
                            const mv2 = myVertices[i+1]
                            const ov1 = otherVertices[j]
                            const ov2 = otherVertices[j+1]
                            if (Utils.intersects(mv1[0] + myX, mv1[1] + myY, mv2[0] + myX, mv2[1] + myY,
                                ov1[0] + otherX, ov1[1] + otherY, ov2[0] + otherX, ov2[1] + otherY)) {
                                // found intersection!
                                // process collision and break out of the loop
                                processCollision(object)
                                return
                            }
                        }
                    }
                }
            }
        }
    }
}