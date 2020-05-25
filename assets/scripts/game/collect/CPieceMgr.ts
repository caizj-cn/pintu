// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class CPieceMgr extends cc.Component {

    private _pieces:cc.Node[] = [];

    private _offset:number = 0;

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    getPieceCount():number{
        return this._pieces.length;
    }

    getPiece(index:number){
        if(index < 0 || index >= this._pieces.length){
            return null;
        }
        return this._pieces[index];
    }

    addPiece(index:number, node:cc.Node){
        if(index < 0 || index > this._pieces.length){
            return;
        }

        if(node == null){
            return;
        }

        this._pieces.splice(index, 0, node);
    }

    removePiece(index:number){
        if(index < 0 || index >= this._pieces.length){
            return;
        }
        this._pieces.splice(index, 1);
    }

    // update (dt) {}
    moveToLeft(index:number){
        if(index < 0 || index >= this._pieces.length){
            return;
        }

        for(let i = 0; i < this._pieces.length; i++){
            if(i >= index){
                this._pieces[i].runAction(cc.moveBy(0.5, -this._offset, 0));
            }
        }
    }

    moveToRight(index:number){
        if(index < 0 || index >= this._pieces.length){
            return;
        }

        for(let i = 0; i < this._pieces.length; i++){
            if(i >= index){
                this._pieces[i].runAction(cc.moveBy(0.1, this._offset, 0));
            }
        }
    }

    setOffset(offset:number){
        this._offset = offset;
    }

    getOffset():number{
        return this._offset;
    }
}
