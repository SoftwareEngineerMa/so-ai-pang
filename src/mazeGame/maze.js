/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import THREE from './lib/Three';

import Box2D from './lib/Box2dWeb.min.js';

import { generateSquareMaze } from './lib/maze'

import Animation from './animation';

import setupCamera from '../utils/setCamera';
import detectFace from '../utils/facedetect';
import { elFadeIn, elFadeOut } from './utils';

import { boardcast, bcType } from './subject';
import { filter, delay } from 'rxjs/operators';
export let gameInstance = null;

export default function getInstance() {
    if (!gameInstance) {
        gameInstance = new Maze();
    }
    return gameInstance;
}

const faceMap = new Map([
    ['leanLeft', 'left'],
    ['leanRight', 'right'],
    ['top', 'top'],
    ['bottom', 'bottom']
])

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

const posMirror = new Map([
    ['left', 'right'],
    ['right', 'left'],
    ['top', 'bottom'],
    ['bottom', 'top']
])






class Maze {

    camera = undefined;
    scene = undefined;
    renderer = undefined;
    light = undefined;

    targetObject = null;

    maze = undefined;
    mazeMesh = undefined;
    mazeDimension = 11;
    planeMesh = undefined;
    ballMesh = undefined;
    ballRadius = 0.25;
    keyAxis = [0, 0];
    ironTexture = THREE.ImageUtils.loadTexture('/texture/ball.png');
    planeTexture = THREE.ImageUtils.loadTexture('/texture/concrete_.png');
    brickTexture = THREE.ImageUtils.loadTexture('/texture/brick_.png');
    awardTexture = THREE.ImageUtils.loadTexture('/texture/award_.png')
    gameState = undefined;

    b2World = Box2D.Dynamics.b2World;
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef;
    b2BodyDef = Box2D.Dynamics.b2BodyDef;
    b2Body = Box2D.Dynamics.b2Body;
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape;
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape;
    b2Settings = Box2D.Common.b2Settings;
    b2Vec2 = Box2D.Common.Math.b2Vec2;

    wWorld = undefined;
    wBall = undefined;

    video = null;
    predictionFace = null;

    hxp = null;
    shade = null;

    awardArray = [];

    hxpTimer = null;

    _hxpToward = 'left';

    hxpAnimation = null;

    hxpAngle = 0;

    // hxp行动阻塞
    // hxpSleep = false;

    lastx = null;
    lasty = null;

    constructor() {


        // Create the renderer.
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Bind keyboard and resize events.
        this.keyboardControl();
        this.hxp = document.querySelector('.hxp');
        this.shade = document.querySelector('.shade');
        this.hxpAnimation = new Animation(this.hxp, window.innerWidth * 0.09 * 2, 5, 6);


        window.onresize = () => {
            this.onResize();
            this.hxpResize();
        }

        window.onload = () => {
            this.shade.style.width = window.innerWidth + 'px';
            this.shade.style.height = window.innerHeight + 'px';
            elFadeIn('.shade', 20, () => { console.log('shade显现'); });
        }


        this.gameState = 'init';
    }

    // 游戏开始
    async start() {
        this.hxpResize();
        await setupCamera().then(async video => {
            video.play();
            // 调用人脸检测示例
            const predictionFace = await detectFace();
            setInterval(() => {
                predictionFace().then((res) => {
                    if (res && res !== 'normal') {
                        this.onMoveKey(moveMap.get(faceMap.get(res)));
                    }
                });

            }, 10);
        });
        boardcast
            .pipe(filter(data => data.type === bcType.HXP_REVIVE), delay(2000))
            .subscribe(() => {
                // this.hxpSleep = false;
            })

        requestAnimationFrame(() => { this.loop() });
    }

    // 游戏初始化
    init() {
        this.maze = generateSquareMaze(this.mazeDimension);
        this.maze[this.mazeDimension - 1][this.mazeDimension - 2] = false;
        this.createPhysicsWorld();
        this.createRenderWorld();
        this.camera.position.set(1, 1, 5);
        this.light.position.set(1, 1, 3);
        this.light.intensity = 0;
        // eslint-disable-next-line no-case-declarations
        let level = Math.floor((this.mazeDimension - 1) / 2 - 4);
        const le = document.querySelector('.level');
        le.innerText = '层数:' + level;
        elFadeOut('.shade', 5, () => { console.log('shade消失'); });
        this.gameState = 'fadein';
    }

    // 场景淡入
    fadeIn() {
        elFadeIn('.hxp', 20);
        elFadeIn('.level', 20);
        this.light.intensity += 0.1 * (1.0 - this.light.intensity);
        this.renderer.render(this.scene, this.camera);
        if (Math.abs(this.light.intensity - 1.0) < 0.05) {
            this.light.intensity = 1.0;
            this.gameState = 'play';
        }
    }

    // 游戏进行中
    play() {
        this.updatePhysicsWorld();
        this.updateRenderWorld();
        this.renderer.render(this.scene, this.camera);

        // Check for victory.
        let mazeX = Math.floor(this.ballMesh.position.x + 0.5);
        let mazeY = Math.floor(this.ballMesh.position.y + 0.5);
        if (mazeX == this.mazeDimension && mazeY == this.mazeDimension - 2) {
            this.mazeDimension += 2;
            this.gameState = 'fadeout';
        }
    }

    // 场景淡出
    fadeOut() {
        this.updatePhysicsWorld();
        this.updateRenderWorld();
        this.light.intensity += 0.1 * (0.0 - this.light.intensity);
        this.renderer.render(this.scene, this.camera);
        if (Math.abs(this.light.intensity - 0.0) < 0.1) {
            this.light.intensity = 0.0;
            this.renderer.render(this.scene, this.camera);
            this.gameState = 'init';
        }
    }

    // canvas循环渲染
    loop() {
        switch (this.gameState) {
            case 'init':
                this.init();
                break;
            case 'fadein':
                this.fadeIn();
                break;
            case 'fadeout':
                elFadeOut('.hxp', 5, () => { console.log('hxp消失'); })
                this.fadeOut();
                break;
            case 'play':
                this.play();
                break;
        }
        requestAnimationFrame(() => { this.loop() })
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
        fixDef.shape = new this.b2CircleShape(this.ballRadius);
        this.wBall.CreateFixture(fixDef);

        // Create the maze.
        bodyDef.type = this.b2Body.b2_staticBody;
        fixDef.shape = new this.b2PolygonShape();
        fixDef.shape.SetAsBox(0.5, 0.5);
        for (let i = 0; i < this.maze.dimension; i++) {
            for (let j = 0; j < this.maze.dimension; j++) {
                if (this.maze[i][j]) {
                    bodyDef.position.x = i;
                    bodyDef.position.y = j;
                    this.wWorld.CreateBody(bodyDef).CreateFixture(fixDef);
                }
            }
        }
    }

    // 创建渲染3d场景
    createRenderWorld() {
        // Create the scene object.
        this.scene = new THREE.Scene();

        // Add the light.
        // this.targetObject = new THREE.Object3D();
        // this.targetOj
        // this.light = new THREE.SpotLight(0xffffff, 1);
        this.light = new THREE.PointLight(0xffffff, 1)
        this.light.position.set(1, 1, 1.3);
        this.scene.add(this.light);

        // Add the ball.
        let g = new THREE.SphereGeometry(this.ballRadius, 32, 16);
        let m = new THREE.MeshPhongMaterial({ map: this.ironTexture });
        this.ballMesh = new THREE.Mesh(g, m);
        this.ballMesh.position.set(1, 1, this.ballRadius);
        this.scene.add(this.ballMesh);
        this.ballMesh.visible = false;
        // this.light.target = this.ballMesh;

        // Add the camera.
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(1, 1, 5);
        this.scene.add(this.camera);

        // Add the maze.
        this.mazeMesh = this.generate_maze_mesh(this.maze);
        this.scene.add(this.mazeMesh);

        // Add the ground.
        g = new THREE.PlaneGeometry(this.mazeDimension * 2, this.mazeDimension * 2, this.mazeDimension, this.mazeDimension);
        // this.planeTexture.wrapS = this.planeTexture.wrapT = THREE.RepeatWrapping;
        this.planeTexture.repeat.set(1, 1);
        m = new THREE.MeshPhongMaterial({ map: this.planeTexture });
        this.planeMesh = new THREE.Mesh(g, m);
        this.planeMesh.position.set((this.mazeDimension - 1) / 2, (this.mazeDimension - 1) / 2, 0);
        this.planeMesh.rotation.set(Math.PI / 2, 0, 0);
        this.scene.add(this.planeMesh);
    }

    // 生成迷宫mesh
    generate_maze_mesh = (field) => {

        console.log(field);
        if (!field[1][2]) {
            this.onMoveKey([0, 1]);
        } else if (!field[2][1]) {
            this.onMoveKey([1, 0]);
        }
        let award = generateSquareMaze(this.mazeDimension);
        let dummy = new THREE.Geometry();
        for (let i = 0; i < field.dimension; i++) {
            for (let j = 0; j < field.dimension; j++) {
                if (field[i][j]) {
                    let geometry = new THREE.CubeGeometry(1, 1, 1, 1, 1, 1);
                    let mesh_ij = new THREE.Mesh(geometry);
                    mesh_ij.position.x = i;
                    mesh_ij.position.y = j;
                    mesh_ij.position.z = 0.5;
                    THREE.GeometryUtils.merge(dummy, mesh_ij);
                } else {
                    if (award[i][j]) {
                        // let ballG = new THREE.SphereGeometry(0.25, 32, 16);
                        // let ballG = new THREE.OctahedronGeometry(0.3);
                        let ballG = new THREE.IcosahedronGeometry( 0.25 );

                        console.log(this.awardTexture);
                        let ballM = new THREE.MeshPhongMaterial({ map: this.awardTexture });
                        let awardBall = new THREE.Mesh(ballG, ballM);
                        // awardBall.rotateZ(Math.PI / 4);
                        awardBall.position.set(i, j, 0.5);
                        this.awardArray.push(awardBall);
                        this.scene.add(awardBall);
                    }
                }
            }
        }
        let material = new THREE.MeshPhongMaterial({ map: this.brickTexture });
        let mesh = new THREE.Mesh(dummy, material)
        return mesh;
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
        // console.log(f, this.wBall.GetPosition());

        if (Math.abs(this.lastx - curPos.x) > 0.08 || Math.abs(this.lasty - curPos.y) > 0.08) {
            this.hxpAnimation.draw();
            this.lastx = curPos.x;
            this.lasty = curPos.y;
        }

        this.keyAxis = [0, 0];

        // Take a time step.
        this.wWorld.Step(1 / 60, 8, 3);
    }

    // 更新3d场景
    updateRenderWorld() {

        // Update ball position.
        let stepX = this.wBall.GetPosition().x - this.ballMesh.position.x;
        let stepY = this.wBall.GetPosition().y - this.ballMesh.position.y;
        this.ballMesh.position.x += stepX;
        this.ballMesh.position.y += stepY;

        // 更新3d小球的转动
        let tempMat = new THREE.Matrix4();
        tempMat.makeRotationAxis(new THREE.Vector3(0, 1, 0), stepX / this.ballRadius);
        tempMat.multiplySelf(this.ballMesh.matrix);
        this.ballMesh.matrix = tempMat;
        tempMat = new THREE.Matrix4();
        tempMat.makeRotationAxis(new THREE.Vector3(1, 0, 0), -stepY / this.ballRadius);
        tempMat.multiplySelf(this.ballMesh.matrix);
        this.ballMesh.matrix = tempMat;
        this.ballMesh.rotation.getRotationFromMatrix(this.ballMesh.matrix);

        // 更新奖励物件转动、消失
        if (this.awardArray.length !== 0) {
            this.awardArray.forEach((item,index) => {
                if (item) {
                    if (this.isHitAward(this.ballMesh.position, item.position) && item) {
                        // hxp阻塞
                        // this.hxpSleep = true;
                        // boardcast.next({ type: bcType.HXP_SLEEP })
                        boardcast.next({type: bcType.HINT_SHOW})
                        console.log('uuu');
                        this.scene.remove(item)
                        this.awardArray[index] = null;
                    } else {
                        item.rotation.z += 0.03;
                    }
                }

            })
        }

        // Update camera and light positions.
        this.camera.position.x += (this.ballMesh.position.x - this.camera.position.x) * 0.1;
        this.camera.position.y += (this.ballMesh.position.y - this.camera.position.y) * 0.1;
        this.camera.position.z += (5 - this.camera.position.z) * 0.1;
        // 调整灯光的位置和高度
        this.light.position.x = this.camera.position.x;
        this.light.position.y = this.camera.position.y;
        this.light.position.z = this.camera.position.z + 3.7;

    }

    // 物体的方向控制
    onMoveKey(axis) {
        // if (this.hxpSleep) {
        //     return
        // }
        if (this.hxpToward === 'top') {
            if (axis[0] === 1) {
                this.hxpAngle += 90;
                this.hxpToward = 'right';
            } else if (axis[0] === -1) {
                this.hxpAngle -= 90;
                this.hxpToward = 'left';
            } else if (axis[1] === -1) {
                this.hxpAngle += 180;
                this.hxpToward = 'bottom'
            }
        } else if (this.hxpToward === 'right') {
            if (axis[1] === 1) {
                this.hxpAngle -= 90;
                this.hxpToward = 'top';
            } else if (axis[1] === -1) {
                this.hxpAngle += 90;
                this.hxpToward = 'bottom';
            } else if (axis[0] === -1) {
                this.hxpAngle -= 180;
                this.hxpToward = 'left';
            }
        } else if (this.hxpToward === 'bottom') {
            if (axis[1] === 1) {
                this.hxpAngle -= 180;
                this.hxpToward = 'top';
            } else if (axis[0] === 1) {
                this.hxpAngle -= 90;
                this.hxpToward = 'right';
            } else if (axis[0] === -1) {
                this.hxpAngle += 90
                this.hxpToward = 'left'
            }
        } else if (this.hxpToward === 'left') {
            if (axis[0] === 1) {
                this.hxpAngle += 180;
                this.hxpToward = 'right';
            } else if (axis[1] === -1) {
                this.hxpAngle -= 90;
                this.hxpToward = 'bottom';
            } else if (axis[1] === 1) {
                this.hxpAngle += 90;
                this.hxpToward = 'top';
            }
        }
        this.hxp.style.transform = `translate(-50%, -50%) rotate(${this.hxpAngle}deg)`;
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

    // 黄小胖大小调整 
    hxpResize() {
        this.hxp.style.width = window.innerWidth * 0.09 + 'px';
        this.hxp.style.height = window.innerWidth * 0.09 + 'px';
        this.hxpAnimation = new Animation(this.hxp, window.innerWidth * 0.09 * 2, 5, 6);
    }

    // 判定hxp触发奖励
    isHitAward(h_position, a_position) {
        if (Math.abs(h_position.x - a_position.x) < 0.23 && Math.abs(h_position.y - a_position.y) < 0.23) {
            return true
        }
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
        let timer = setInterval(() => {
            if (axis[0] != 0 || axis[1] != 0) {
                this.onMoveKey(axis);
            }
        }, 1);
    }

    get hxpToward() {
        return this._hxpToward;
    }

    set hxpToward(val) {
        this._hxpToward = val;
        // 传递信息至hint组件中
        boardcast.next({type: bcType.HXP_DIVERSION, value: posMirror.get(val)});
        console.log('发送hint');
    }
}