/* eslint-disable no-unused-vars */
import THREE from './lib/Three';

import Box2D from './lib/Box2dWeb.min.js';

import KeyboardJS from './lib/keyboard'

import { generateSquareMaze } from './lib/maze'

import Animation from './animation';

import setupCamera from '../utils/setCamera';
import detectFace from '../utils/facedetect';
import { animationPlay, elFadeIn, elFadeOut } from './utils';

export let gameInstance = null;


export class Maze {

    camera = undefined;
    scene = undefined;
    renderer = undefined;
    light = undefined;
    maze = undefined;
    mazeMesh = undefined;
    mazeDimension = 11;
    planeMesh = undefined;
    ballMesh = undefined;
    ballRadius = 0.25;
    keyAxis = [0, 0];
    ironTexture = THREE.ImageUtils.loadTexture('/texture/ball.png');
    planeTexture = THREE.ImageUtils.loadTexture('/texture/concrete.png');
    brickTexture = THREE.ImageUtils.loadTexture('/texture/brick.png');
    awardTexture = THREE.ImageUtils.loadTexture('/texture/award.png')
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

    hxpTimer = null;

    hxpAnimation = null;

    hxpAngle = 0;

    lastx = null;
    lasty = null;

    constructor() {

        // Create the renderer.
        this.renderer = new THREE.WebGLRenderer();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(this.renderer.domElement);

        // Bind keyboard and resize events.
        KeyboardJS.bind.axis('left', 'right', 'down', 'up', this.onMoveKey);
        KeyboardJS.bind.axis('h', 'l', 'j', 'k', this.onMoveKey);
        this.hxp = document.querySelector('.hxp');
        this.shade = document.querySelector('.shade');
        this.hxpAnimation = new Animation(this.hxp, window.innerWidth * 0.09 * 2, 5, 6);


        window.onresize = () => {
            this.onResize();
        }

        window.onload = () => {
            this.shade.style.width = window.innerWidth + 'px';
            this.shade.style.height = window.innerHeight + 'px';
            elFadeIn('.shade', 20, () => { console.log('shade显现'); });
        }


        this.gameState = 'init';
    }

    // static getInstance = () => {
    //     if (!gameInstance) {
    //         gameInstance = new Maze();
    //     }
    //     return gameInstance;
    // }

    // 游戏开始
    start = () => {
        this.hxpResize();
        setupCamera().then(async video => {
            video.play();

            // 调用人脸检测示例
            const predictionFace = await detectFace();
            setInterval(() => {
                predictionFace().then((res) => {
                    const facePose = res;
                    if (facePose === 'left') {
                        this.onMoveKey([-1, 0]);
                    } else if (facePose === 'right') {
                        this.onMoveKey([1, 0]);
                    } else if (facePose === 'top') {
                        this.onMoveKey([0, 1]);
                    } else if (facePose === 'bottom') {
                        this.onMoveKey([0, -1]);
                    }
                    // console.log(facePose);
                });

            }, 10);
        });

        requestAnimationFrame(() => { this.loop() });
    }

    // 游戏初始化
    init = () => {
        this.maze = generateSquareMaze(this.mazeDimension);
        this.maze[this.mazeDimension - 1][this.mazeDimension - 2] = false;
        this.createPhysicsWorld();
        this.createRenderWorld();
        this.camera.position.set(1, 1, 5);
        this.light.position.set(1, 1, 1.3);
        this.light.intensity = 0;
        // eslint-disable-next-line no-case-declarations
        let level = Math.floor((this.mazeDimension - 1) / 2 - 4);
        const le = document.querySelector('.level');
        le.innerText = '层数:' + level;
        elFadeOut('.shade', 5, () => { console.log('shade消失'); });
        this.gameState = 'fadein';
    }

    // 场景淡入
    fadeIn = () => {
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
    play = () => {
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
    fadeOut = () => {
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
    loop = () => {
        switch (this.gameState) {
            case 'init':
                this.init();
                break;
            case 'fadein':
                this.fadeIn();
                break;
            case 'fadeout':
                this.fadeOut();
                break;
            case 'play':
                this.play();
                break;
        }
        requestAnimationFrame(() => { this.loop() })
    }

    // 创建物理世界
    createPhysicsWorld = () => {
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
    createRenderWorld = () => {
        // Create the scene object.
        this.scene = new THREE.Scene();

        // Add the light.
        this.light = new THREE.PointLight(0xffffff, 1);
        this.light.position.set(50, 50, 50);
        this.scene.add(this.light);

        // Add the ball.
        let g = new THREE.SphereGeometry(this.ballRadius, 32, 16);
        let m = new THREE.MeshPhongMaterial({ map: this.ironTexture });
        this.ballMesh = new THREE.Mesh(g, m);
        this.ballMesh.position.set(1, 1, this.ballRadius);
        // this.scene.add(this.ballMesh);



        // Add the camera.
        this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 1000);
        this.camera.position.set(1, 1, 5);
        this.scene.add(this.camera);

        // Add the maze.
        this.mazeMesh = this.generate_maze_mesh(this.maze);
        this.scene.add(this.mazeMesh);

        // Add the ground.
        g = new THREE.PlaneGeometry(this.mazeDimension * 10, this.mazeDimension * 10, this.mazeDimension, this.mazeDimension);
        this.planeTexture.wrapS = this.planeTexture.wrapT = THREE.RepeatWrapping;
        this.planeTexture.repeat.set(this.mazeDimension * 5, this.mazeDimension * 5);
        m = new THREE.MeshPhongMaterial({ map: this.planeTexture });
        this.planeMesh = new THREE.Mesh(g, m);
        this.planeMesh.position.set((this.mazeDimension - 1) / 2, (this.mazeDimension - 1) / 2, 0);
        this.planeMesh.rotation.set(Math.PI / 2, 0, 0);
        this.scene.add(this.planeMesh);
    }

    // 生成迷宫mesh
    generate_maze_mesh = (field) => {

        console.log(field);
        if (!field[8][1]) {
            this.onMoveKey([0, 1]);
        } else if (!field[9][2]) {
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
                        let ballG = new THREE.OctahedronGeometry(0.2);
                        let ballM = new THREE.MeshPhongMaterial({ map: this.awardTexture });
                        let awardBall = new THREE.Mesh(ballG, ballM);
                        // awardBall.rotateZ(Math.PI / 4);
                        awardBall.position.set(i, j, 0.5);
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
    updatePhysicsWorld = () => {
        // Apply "friction". 
        let lv = this.wBall.GetLinearVelocity();
        lv.Multiply(0.95);
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
    updateRenderWorld = () => {

        // Update ball position.
        let stepX = this.wBall.GetPosition().x - this.ballMesh.position.x;
        let stepY = this.wBall.GetPosition().y - this.ballMesh.position.y;
        this.ballMesh.position.x += stepX;
        this.ballMesh.position.y += stepY;

        // Update ball rotation.
        let tempMat = new THREE.Matrix4();
        tempMat.makeRotationAxis(new THREE.Vector3(0, 1, 0), stepX / this.ballRadius);
        tempMat.multiplySelf(this.ballMesh.matrix);
        this.ballMesh.matrix = tempMat;
        tempMat = new THREE.Matrix4();
        tempMat.makeRotationAxis(new THREE.Vector3(1, 0, 0), -stepY / this.ballRadius);
        tempMat.multiplySelf(this.ballMesh.matrix);
        this.ballMesh.matrix = tempMat;
        this.ballMesh.rotation.getRotationFromMatrix(this.ballMesh.matrix);

        // Update camera and light positions.
        this.camera.position.x += (this.ballMesh.position.x - this.camera.position.x) * 0.1;
        this.camera.position.y += (this.ballMesh.position.y - this.camera.position.y) * 0.1;
        this.camera.position.z += (5 - this.camera.position.z) * 0.1;
        this.light.position.x = this.camera.position.x;
        this.light.position.y = this.camera.position.y;
        this.light.position.z = this.camera.position.z - 3.7;
    }

    // 物体的方向控制
    onMoveKey = (axis) => {
        if (axis[0] == 1) {
            if (this.hxpAngle !== 180) {
                this.hxpAngle = 180;
                this.hxp.style.transform = `translate(-50%, -50%) rotate(${this.hxpAngle}deg)`;
            }
        } else if (axis[0] == -1) {
            if (this.hxpAngle !== 0) {
                console.log(this.hxpAngle);
                if (this.hxpAngle == 270) {
                    this.hxpAngle = 360;
                    this.hxp.style.transform = `translate(-50%, -50%) rotate(${this.hxpAngle}deg)`;
                } else if (this.hxpAngle == 360) {
                    this.hxpAngle = 0;
                    this.hxp.style.transition = '';
                    this.hxp.style.transform = `translate(-50%, -50%) rotate(${this.hxpAngle}deg)`;
                    // this.hxp.style.transition = 'transform 1s';
                } else {
                    this.hxpAngle = 0;
                    this.hxp.style.transform = `translate(-50%, -50%) rotate(${this.hxpAngle}deg)`;
                }
            }
        } else if (axis[1] == 1) {
            if (this.hxpAngle !== 90) {
                this.hxpAngle = 90;
                this.hxp.style.transform = `translate(-50%, -50%) rotate(${this.hxpAngle}deg)`;
            }
        } else if (axis[1] == -1) {
            if (this.hxpAngle !== 270) {
                this.hxpAngle = 270;
                this.hxp.style.transform = `translate(-50%, -50%) rotate(${this.hxpAngle}deg)`;
            }

        }

        this.keyAxis = axis.slice(0);
    }

    // 窗口大小调整
    onResize = () => {
        if (this.renderer && this.camera) {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
        }
    }

    hxpResize = () => {
        const ratio = window.innerHeight / window.innerWidth;
        this.hxp.style.width = window.innerWidth * 0.09 + 'px';
        this.hxp.style.height = window.innerWidth * 0.09 + 'px';
    }
}