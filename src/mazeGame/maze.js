import * as THREE from 'three';
import { generateSquareMaze } from './lib/maze'
import Box2D from 'box2dweb/box2d.js';
import { boardcast, bcType } from './subject';
import { filter } from 'rxjs/operators';
import { isHit } from './utils';
import setupCamera from '../utils/setCamera';
import detectFace from '../utils/facedetect';




export default function getInstance() {
    if (!mazeInstance) {
        mazeInstance = new Maze();
    }
    return mazeInstance;
}

let mazeInstance = null;

const moveMap = new Map([
    ['left', [-1, 0]],
    ['right', [1, 0]],
    ['top', [0, 1]],
    ['bottom', [0, -1]],
    ['normal', [0, 0]],
    [37, [-1, 0]],
    [40, [0, -1]],
    [39, [1, 0]],
    [38, [0, 1]]
])

const faceMap = new Map([
    ['leanLeft', 'left'],
    ['leanRight', 'right'],
    ['top', 'top'],
    ['bottom', 'bottom'],
])


const floorPath = '/texture/concrete.png';
const wallPath = '/texture/brick.png';
const awardPath = '/texture/ball.png';



class Maze{

    camera;

    scene;

    cameraPosition;

    renderer;

    light;

    maze;

    // 物理引擎
    b2World = Box2D.Dynamics.b2World;
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    b2BodyDef = Box2D.Dynamics.b2BodyDef;
    b2Body = Box2D.Dynamics.b2Body;
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    b2Settings = Box2D.Common.b2Settings;
    b2Vec2 = Box2D.Common.Math.b2Vec2;

    wWorld = null;
    wBall = null;
    maze = null;
    award = null;

    mazeScale = 11;

    ballMesh = null;

    keyAxis = [0, 0];

    gameStatus = '';

    lastx = null;
    lasty = null;

    hxpSleep = false;

    constructor() {
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);
        this.scene = new THREE.Scene();
        this.gameStatus = 'init';

        window.onresize = () => {
            this.onResize();
        }
    }

    async start(){
        await setupCamera().then(async video => {
            video.play();
            // 调用人脸检测示例
            const predictionFace = await detectFace();
            setInterval(() => {
                predictionFace().then((res) => {
                    if (faceMap.has(res)) {
                        this.onMoveKey(moveMap.get(faceMap.get(res)));
                    }
                });

            }, 10);
        });
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_REVIVE))
            .subscribe(() => {
                this.hxpSleep = false;
            })
        requestAnimationFrame(() => {this.loop()});
    }


    loop() {
        switch (this.gameStatus) {
            case 'init':
                this.init();
                break;
            case 'fadein':
                this.fadeIn();
                break;
            case 'play':
                this.play();
                break
            case 'fadeout':
                if (this.hxpSleep) {
                    break;
                }
                this.fadeOut();
                break;
        }
        requestAnimationFrame(() => { this.loop() });
    }

    init() {
        this.maze = generateSquareMaze(this.mazeScale);
        this.maze[this.mazeScale - 1][this.mazeScale - 2] = false;
        this.award = generateSquareMaze(this.mazeScale);
        this.scene = new THREE.Scene();
        this.cameraPosition = {x: 1, y: 1, z: 15};
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
        this.scene.add(this.camera);
        this.light = new THREE.PointLight(0xffffff, 1);
        this.light.position.set(1,1,1.3)
        this.scene.add(this.light);
        this.create3DWorld();
        this.createPhysicsWorld();
        this.keyboardControl();
        this.gameStatus = 'fadein';
        boardcast.next({type: bcType.SHADE_HIDE});
    }

    fadeIn() {
        this.light.intensity += 0.1 * (1.0 - this.light.intensity);
        this.renderer.render(this.scene, this.camera);
        if (Math.abs(this.light.intensity - 1.0) < 0.05) {
            this.light.intensity = 1.0;
            this.gameStatus = 'play';
            boardcast.next({ type: bcType.HXP_SHOW});
            boardcast.next({ type: bcType.TIP_SHOW });
            boardcast.next({ type: bcType.LEVEL_SHOW });
            console.log(this.maze);
            if (!this.maze[1][2]) {
                boardcast.next({ type: bcType.HXP_TURE_TO, value: [0,1]});
            } else if (!this.maze[2][1]) {
                boardcast.next({ type: bcType.HXP_TURE_TO, value: [1, 0] });
            }
        }
    }

    play() {
        this.updatePhysicsWorld();
        this.updateRenderWorld();
        this.renderer.render(this.scene, this.camera);

        // 判定是否胜利
        let mazeX = Math.floor(this.ballMesh.position.x + 0.5);
        let mazeY = Math.floor(this.ballMesh.position.y + 0.5);
        if (mazeX == this.mazeScale && mazeY == this.mazeScale - 2) {
            this.hxpSleep = true;
            // 小胖阻塞，通知弹出modal
            boardcast.next({ type: bcType.HXP_SLEEP })
            // 通知隐藏tip
            boardcast.next({ type: bcType.TIP_SHOW })
            // 通知更新tip
            boardcast.next({ type: bcType.TIP_UPDATE })
            // this.resetTime();
            this.mazeScale += 2;
            this.gameStatus = 'fadeout';
        }
    }

    fadeOut() {
        this.updatePhysicsWorld();
        this.light.intensity += 0.1 * (0.0 - this.light.intensity);
        this.renderer.render(this.scene, this.camera);
        if (Math.abs(this.light.intensity - 0.0) < 0.1) {
            this.light.intensity = 0.0;
            this.renderer.render(this.scene, this.camera);
            this.gameStatus = 'init';
            boardcast.next({ type: bcType.HXP_HIDE});
            boardcast.next({ type: bcType.SHADE_SHOW });
        }
    }

    // 更新相机位置
    updateCamera() {
        this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);
    }

    // 更新灯光位置
    updateLight() {
        this.light.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z + 3.7);
    }


    // 创建3d场景
    create3DWorld() {
        // 地板
        const floorTexture = new THREE.TextureLoader().load(floorPath);
        const floor = this.createFloor(floorTexture);
        this.scene.add(floor)

        // 墙体
        const wallTexture = new THREE.TextureLoader().load(wallPath);
        const wall = this.createWall(wallTexture);
        this.scene.add(wall);

        // 奖励
        const awardTexture = new THREE.TextureLoader().load(awardPath);
        const award = this.createAward(awardTexture);
        this.scene.add(award);


        // 小球
        const g = new THREE.SphereGeometry(0.25, 32, 16);
        const t = new THREE.TextureLoader().load('../static/img/ball.png');
        let m = new THREE.MeshPhongMaterial({ map: t });
        this.ballMesh = new THREE.Mesh(g,m);
        this.ballMesh.position.set(1, 1, 0.25);
        this.scene.add(this.ballMesh);
        this.ballMesh.visible = false;
    }

    // 创建物理世界
    createPhysicsWorld() {
        // Create the world object.
        this.wWorld = new this.b2World(new this.b2Vec2(0, 0), true);

        // Create the ball.
        let bodyDef = new this.b2BodyDef();
        bodyDef.type = this.b2Body.b2_dynamicBody;
        bodyDef.position.Set(1, 1);
        this.wBall = this.wWorld.CreateBody(bodyDef);
        let fixDef = new this.b2FixtureDef();
        fixDef.density = 1.0;
        fixDef.friction = 0.0;
        fixDef.restitution = 0.25;
        fixDef.shape = new this.b2CircleShape(0.25);
        this.wBall.CreateFixture(fixDef);

        // Create the maze.
        bodyDef.type = this.b2Body.b2_staticBody;
        fixDef.shape = new this.b2PolygonShape();
        fixDef.shape.SetAsBox(0.5, 0.5);
        for (let i = 0; i < this.mazeScale; i++) {
            for (let j = 0; j < this.mazeScale; j++) {
                if (this.maze[i][j]) {
                    bodyDef.position.x = i;
                    bodyDef.position.y = j;
                    this.wWorld.CreateBody(bodyDef).CreateFixture(fixDef);
                }
            }
        }
    }

    // 更新物理世界
    updatePhysicsWorld() {
        // Apply "friction". 
        let lv = this.wBall.GetLinearVelocity();
        // 调整物体惯性
        lv.Multiply(0.93);
        this.wBall.SetLinearVelocity(lv);
        // Apply user-directed force.
        let f = new this.b2Vec2(this.keyAxis[0] * this.wBall.GetMass() * 0.25, this.keyAxis[1] * this.wBall.GetMass() * 0.25);
        let curPos = this.wBall.GetPosition();
        this.wBall.ApplyImpulse(f, curPos);

        if (Math.abs(this.lastx - curPos.x) > 0.08 || Math.abs(this.lasty - curPos.y) > 0.08) {
            boardcast.next({ type: bcType.HXP_RUN});
            this.lastx = curPos.x;
            this.lasty = curPos.y;
        }

        this.keyAxis = [0, 0];

        // Take a time step.
        this.wWorld.Step(1 / 60, 8, 3);

    }

    // 更新3d场景
    updateRenderWorld() {    
        // 更新小球位置
        let stepX = this.wBall.GetPosition().x - this.ballMesh.position.x;
        let stepY = this.wBall.GetPosition().y - this.ballMesh.position.y;
        this.ballMesh.position.x += stepX;
        this.ballMesh.position.y += stepY;

        // 更新camera位置
        this.cameraPosition.x += (this.ballMesh.position.x - this.camera.position.x) * 0.1;
        this.cameraPosition.y += (this.ballMesh.position.y - this.camera.position.y) * 0.1;
        this.cameraPosition.z += (5 - this.camera.position.z) * 0.1;

        // 更新奖励转动与消失
        const awards = this.scene.getObjectByName('award');
        // console.log(awards);
        if (awards.children.length !== 0) {
            awards.children.forEach((item) => {
                if (item) {
                    if (isHit(this.camera.position, item.position)) {
                        boardcast.next({type: bcType.HINT_SHOW})
                        awards.remove(item);
                    } else {
                        item.rotation.z += 0.03;
                    }
                    
                }
            })
        }

        this.updateCamera();
        this.updateLight();

    }


    // 创建地板
    createFloor(texture) {
        const floorGroup = new THREE.Group();
        for (let i = 0; i < this.mazeScale * 2; i++){
            for (let j = 0; j < this.mazeScale * 2; j++){
                floorGroup.add(this.getFloorBlock(1, 1, texture, { x: i, y: j, z:0 }));
            }
        }
        floorGroup.position.set(-5,-5,0);
        return floorGroup;
    }

    // 创建墙壁
    createWall(texture) {
        const wallGroup = new THREE.Group();
        for (let i=0; i < this.maze.dimension; i++){
            for(let j=0; j < this.maze.dimension; j++){
                if (this.maze[i][j]){
                    const block = this.getBoxWallBlock(1, 1, 1,texture,{ x: i,y: j,z: 0.5 })
                    wallGroup.add(block);
                }
            }
        }
        return wallGroup;
    }

    // 创建奖励
    createAward(texture) {
        const awardGroup = new THREE.Group();
        awardGroup.name = 'award';
        for (let i=0; i < this.award.dimension; i++) {
            for(let j=0; j < this.award.dimension; j++) {
                if (!this.maze[i][j] && this.award[i][j]) {
                    const block = this.getAwardBlock(texture, { x: i, y: j, z: 0.7});
                    awardGroup.add(block);
                }
            }
        }
        return awardGroup;
    }

    // 创建奖励块
    getAwardBlock(texture, position) {
        const awardG = new THREE.IcosahedronGeometry( 0.25 );
        const awardM = new THREE.MeshPhongMaterial({ map: texture });
        const award = new THREE.Mesh(awardG, awardM);
        award.position.set(position.x, position.y, position.z);
        return award;
    }

    // 创建砖墙块
    getBoxWallBlock(width, height, thick, texture, position){
        const box = new THREE.BoxGeometry(width, height, thick);
        const boxMaterial = new THREE.MeshPhongMaterial({ map: texture });
        const mesh = new THREE.Mesh(box, boxMaterial);
        mesh.position.set(position.x, position.y, position.z);
        return mesh;
    }

    // 创建地板块
    getFloorBlock(width, height, texture, {x, y, z}) {
        const floor = new THREE.PlaneGeometry(width, height);
        const floorMaterial = new THREE.MeshPhongMaterial({ map: texture });
        const mesh = new THREE.Mesh(floor, floorMaterial);
        mesh.position.set(x, y, z);
        return mesh;
    }


    // 添加键盘控制
    keyboardControl() {
        let axis = [0, 0];
        // 移动开关
        const moveSwitch = new Map([
            [37, true],
            [38, true],
            [39, true],
            [40, true]
        ])
        const keydown = (code, callback) => {
            if (code instanceof Array) {
                document.addEventListener('keydown', (ev) => {
                    if (ev && code.includes(ev.keyCode)) {
                        callback(ev.keyCode);
                    }
                })
            } else if (typeof code === "number") {
                document.addEventListener('keydown', (ev) => {
                    if (ev && ev.keyCode === code) {
                        callback(code);
                    }
                })
            }
        }

        const keyup = (code, callback) => {
            if (code instanceof Array) {
                document.addEventListener('keyup', (ev) => {
                    if (ev && code.includes(ev.keyCode)) {
                        callback(ev.keyCode);
                    }
                })
            } else if (typeof code === "number") {
                document.addEventListener('keyup', (ev) => {
                    if (ev && ev.keyCode === code) {
                        callback(code);
                    }
                })
            }
        }

        keydown([37, 38, 39, 40], (code) => {
            moveSwitch.set(code, false);
            axis = moveMap.get(code);

        })

        keyup([37, 38, 39, 40], (code) => {
            moveSwitch.set(code, true);
            if (moveSwitch.get(37) && moveSwitch.get(38) && moveSwitch.get(39) && moveSwitch.get(40)) {
                axis = [0, 0];
            } else {
                for (let k of [37, 38, 39, 40]) {
                    if (!moveSwitch.get(k)) {
                        axis = moveMap.get(k)
                        break
                    }
                }
            }
        })
        setInterval(() => {
            if (axis[0] != 0 || axis[1] != 0) {
                this.onMoveKey(axis);
            }
        }, 1);
    }

    onMoveKey(axis) {
        boardcast.next({ type: bcType.HXP_TURE_TO, value: axis })
        this.keyAxis = axis.slice(0);
    }

    // 窗口大小调整
    onResize() {
        if (this.renderer && this.camera) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }



    
}