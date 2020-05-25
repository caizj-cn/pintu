// Learn TypeScript:
//  - https://docs.cocos.com/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - https://docs.cocos.com/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - https://docs.cocos.com/creator/manual/en/scripting/life-cycle-callbacks.html

import CPiece from "./CPiece";
import CPieceMgr from "./CPieceMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export default class CGame extends cc.Component {
    @property(cc.Node)
    nodeBg:cc.Node = null;

    @property(cc.Prefab)
    prefabPiece:cc.Prefab = null;

    @property(cc.Node)
    nodePieceMgr:cc.Node = null;

    @property([cc.SpriteFrame])
    sfpPieceMask:cc.SpriteFrame[] = [];

    private _col:number = 2;
    private _row:number = 3;
    private _bgWidth:number = 604;
    private _bgHeight:number = 910;
    private _piecePos:any[] = [];//拼图位置
    private _mgrScale:number = 0.37;//管理器上缩放

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {
        this.calcPiecePos();
        this.reloadAllPiece();
    }

    reloadAllPiece(){
        let count:number = 0;
        let offset:number = 0;
        for(let i = 0; i < this._row; i++){
            for(let j = 0; j < this._col; j++){
                let node = cc.instantiate(this.prefabPiece);
                let ts = node.getComponent(CPiece);
                ts.reloadBg(this._bgWidth,this._bgHeight,this._col,this._row,i,j);
                ts.setTouchEndCallback( (node:cc.Node,pos:cc.Vec2) => {
                    this.onPieceTouchEndCallback(node,pos);
                });
                ts.setTouchStartCallback( (node:cc.Node) => {
                    this.onPieceTouchStartCallback(node);
                });
                let index = j + i * this._col;
                ts.setBgMaskSpriteFrame(this.sfpPieceMask[index]);

                node.parent = this.nodePieceMgr;
                this.nodePieceMgr.getComponent(CPieceMgr).addPiece(count, node);
                node.scale = this._mgrScale;
                let width = node.width * node.scale;
                node.x = (width >> 1) + count * width;
                node.y = 0;
                count++;
                if(offset <= 0){
                    offset = width;
                }
            }
        }
        this.nodePieceMgr.getComponent(CPieceMgr).setOffset(offset);
    }

    onPieceTouchStartCallback(node:cc.Node){
        let tsMgr:CPieceMgr = this.nodePieceMgr.getComponent(CPieceMgr);
        let index = -1;
        for(let i = 0; i < tsMgr.getPieceCount(); i++){
            if(node == tsMgr.getPiece(i)){
                index = i;
                break;
            }
        }
        tsMgr.removePiece(index);
        tsMgr.moveToLeft(index);
    }

    // 松开回调
    onPieceTouchEndCallback(node:cc.Node,pos:cc.Vec2){
        let len:number = cc.winSize.width;
        let targetX:number = 0;
        let targetY:number = 0;

        // 拼图处
        for(let i = 0; i < this._row; i++){
            for(let j = 0; j < this._col; j++){
                let target:cc.Vec2 = this.nodeBg.convertToWorldSpaceAR(this._piecePos[i][j]);
                let dis = target.sub(pos).mag();
                if(dis < len){
                    len = dis;
                    targetX = this._piecePos[i][j].x;
                    targetY = this._piecePos[i][j].y;
                }
            }
        }

        if(node.parent != this.nodeBg){
            this.changePieceParent(node, this.nodeBg);
            node.scale = 1;
        }

        // 碎片处
        let pieceTarget = new cc.Vec2();
        pieceTarget.y = 0;
        let tsMgr:CPieceMgr = this.nodePieceMgr.getComponent(CPieceMgr);
        let find = false;
        let index = -1;
        for(let i = 0; i <= tsMgr.getPieceCount(); i++){
            pieceTarget.x = tsMgr.getOffset() / 2 + i * tsMgr.getOffset();
            let target = this.nodePieceMgr.convertToWorldSpaceAR(pieceTarget);
            let dis = target.sub(pos).mag();
            if(dis < len){
                find = true;
                len = dis;
                targetX = pieceTarget.x;
                targetY = pieceTarget.y;
                index = i;
            }
        }
        if(find){
            this.changePieceParent(node,this.nodePieceMgr);
            node.scale = this._mgrScale;
            tsMgr.moveToRight(index);
            tsMgr.addPiece(index,node);
        }
        
        node.runAction(cc.moveTo(0.1, targetX, targetY));
    }

    changePieceParent(node:cc.Node, parent:cc.Node){
        if(node.parent == parent){
            return;
        }

        let tmpVec:cc.Vec2 = new cc.Vec2(node.x, node.y);
        tmpVec = parent.convertToNodeSpaceAR(tmpVec);
        node.x = tmpVec.x;
        node.y = tmpVec.y;
        node.parent = parent;

        if(parent == this.nodeBg){
            node.getComponent(CPiece).setMoveFrom(1);
        }
        else if(parent == this.nodePieceMgr){
            node.getComponent(CPiece).setMoveFrom(0);
        }
    }

    // update (dt) {}

    calcPiecePos(){
        let cellWidth = this._bgWidth / this._col;
        let cellHeigth = this._bgHeight / this._row;
        let startWidth = (cellHeigth >> 1);
        let startHeight = (cellHeigth >> 1);

        this._piecePos = [];
        for(let i = 0; i < this._row; i++){
            this._piecePos[i] = [];
            for(let j = 0; j< this._col; j++){
                let vec = new cc.Vec2();
                vec.x = startWidth + cellWidth * j;
                vec.y = -startHeight - cellHeigth * i;
                this._piecePos[i].push(vec);
            }
        }
    }
}
