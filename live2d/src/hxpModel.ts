// live2d 模型的加载以及动画的播放

import 'whatwg-fetch';

import { CubismDefaultParameterId } from '@framework/cubismdefaultparameterid';
import { CubismModelSettingJson } from '@framework/cubismmodelsettingjson';
import {
  BreathParameterData,
  CubismBreath
} from '@framework/effect/cubismbreath';
import { CubismEyeBlink } from '@framework/effect/cubismeyeblink';
import { ICubismModelSetting } from '@framework/icubismmodelsetting';
import { CubismIdHandle } from '@framework/id/cubismid';
import { CubismFramework } from '@framework/live2dcubismframework';
import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { CubismUserModel } from '@framework/model/cubismusermodel';
import {
  ACubismMotion,
  FinishedMotionCallback
} from '@framework/motion/acubismmotion';
import { CubismMotion } from '@framework/motion/cubismmotion';
import {
  CubismMotionQueueEntryHandle,
  InvalidMotionQueueEntryHandleValue
} from '@framework/motion/cubismmotionqueuemanager';
import { csmMap } from '@framework/type/csmmap';
import { csmRect } from '@framework/type/csmrectf';
import { csmString } from '@framework/type/csmstring';
import { csmVector } from '@framework/type/csmvector';
import { CubismLogInfo } from '@framework/utils/cubismdebug';

import * as LAppDefine from './lappdefine';
import { canvas, frameBuffer, gl, HxpAgent } from './hxpAgent';
import { HxpTimer } from './hxpTimer';
import { TextureInfo } from './hxpTexture';

export const fileDir = '../model/Hiyori/'
const fileName = `Hiyori.model3.json`;

enum LoadStep {
  LoadAssets,
  LoadModel,
  WaitLoadModel,
  LoadExpression,
  WaitLoadExpression,
  LoadPhysics,
  WaitLoadPhysics,
  LoadPose,
  WaitLoadPose,
  SetupEyeBlink,
  SetupBreath,
  LoadUserData,
  WaitLoadUserData,
  SetupEyeBlinkIds,
  SetupLipSyncIds,
  SetupLayout,
  LoadMotion,
  WaitLoadMotion,
  CompleteInitialize,
  CompleteSetupModel,
  LoadTexture,
  WaitLoadTexture,
  CompleteSetup
}

enum loadStepAnnotation {
  加载静态文件,
  加载模型,
  等待加载模型,
  加载表情,
  等待加载表情,
  加载身体,
  等待加载身体,
  加载姿势,
  等待加载姿势,
  启动眨眼,
  启动呼吸,
  加载用户数据,
  等待加载用户数据,
  启动眨眼计数,
  启动对口型计数,
  启动布局,
  加载动作,
  等待加载动作,
  完成模型初始化,
  完成启动模型,
  加载纹理,
  等待加载纹理,
  完成启动
}

/**
 * 用户实际使用的模型实现类<br>
 * 进行模型生成、功能组件生成、更新处理和渲染的调用。
 */
export class HxpModel extends CubismUserModel {


  _modelSetting: ICubismModelSetting; // 模型设定信息
  _modelHomeDir: string; // 模型设置所在的目录
  _userTimeSeconds: number; // delta时间的累计值[秒]

  _eyeBlinkIds: csmVector<CubismIdHandle>; // 在模型中设定的眨眼功能用参数ID
  _lipSyncIds: csmVector<CubismIdHandle>; // 在模型中设定的对口型功能用参数ID

  _motions: csmMap<string, ACubismMotion>; // 正在读取的动作列表
  _expressions: csmMap<string, ACubismMotion>; // 正在读取的表情列表

  _hitArea: csmVector<csmRect>;
  _userArea: csmVector<csmRect>;

  _idParamAngleX: CubismIdHandle; // 参数ID: ParamAngleX
  _idParamAngleY: CubismIdHandle; // 参数ID: ParamAngleY
  _idParamAngleZ: CubismIdHandle; // 参数ID: ParamAngleZ
  _idParamEyeBallX: CubismIdHandle; // 参数ID: ParamEyeBallX
  _idParamEyeBallY: CubismIdHandle; // 参数ID: ParamEyeBAllY
  _idParamBodyAngleX: CubismIdHandle; // 参数ID: ParamBodyAngleX

  state: number; // 用于当前状态管理
  _expressionCount: number; // 表情数据计数
  _textureCount: number; // 表情数据计数
  _motionCount: number; // 运动数据计数
  _allMotionCount: number; // 运动总数


  /**
   * 构造函数
   */
  public constructor() {
    super();

    this._modelSetting = null;
    this._modelHomeDir = null;
    this._userTimeSeconds = 0.0;

    this._eyeBlinkIds = new csmVector<CubismIdHandle>();
    this._lipSyncIds = new csmVector<CubismIdHandle>();

    this._motions = new csmMap<string, ACubismMotion>();
    this._expressions = new csmMap<string, ACubismMotion>();

    this._hitArea = new csmVector<csmRect>();
    this._userArea = new csmVector<csmRect>();

    this._idParamAngleX = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamAngleX
    );
    this._idParamAngleY = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamAngleY
    );
    this._idParamAngleZ = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamAngleZ
    );
    this._idParamEyeBallX = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamEyeBallX
    );
    this._idParamEyeBallY = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamEyeBallY
    );
    this._idParamBodyAngleX = CubismFramework.getIdManager().getId(
      CubismDefaultParameterId.ParamBodyAngleX
    );

    this._state = LoadStep.LoadAssets;
    this._expressionCount = 0;
    this._textureCount = 0;
    this._motionCount = 0;
    this._allMotionCount = 0;

    this.loadAssets(fileDir, fileName);

  }

  /**
   * model3.json从所处的目录和文件路径生成模型
   * @param dir
   * @param fileName
   */
  public async loadAssets(dir: string, fileName: string) {
    this._modelHomeDir = dir;
    let setting: ICubismModelSetting = null;
    await fetch(`${this._modelHomeDir}${fileName}`)
      .then(response => response.arrayBuffer())
      .then(arrayBuffer => {
        setting = new CubismModelSettingJson(
          arrayBuffer,
          arrayBuffer.byteLength
        );

        // 更新状态
        this._state = LoadStep.LoadModel;
      });
    // 保存结果
    this.setupModel(setting);
  }

  /**
   * model3.json中生成模型。
   * model3.json的描述，进行模型生成、运动、物理运算等组件生成。
   *
   * @param setting ICubismModelSetting的实例
   */
  private async setupModel(setting: ICubismModelSetting) {
    this._updating = true;
    this._initialized = false;

    this._modelSetting = setting;

    // CubismModel
    if (this._modelSetting.getModelFileName() != '') {
      const modelFileName = this._modelSetting.getModelFileName();

      fetch(`${this._modelHomeDir}${modelFileName}`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          this.loadModel(arrayBuffer);
          this._state = LoadStep.LoadExpression;

          loadCubismExpression();
        });

      this._state = LoadStep.WaitLoadModel;
    } else {
      HxpTimer.printMessage('Model data does not exist.');
    }

    // Expression
    const loadCubismExpression = async () => {
      if (this._modelSetting.getExpressionCount() > 0) {
        const count: number = this._modelSetting.getExpressionCount();

        for (let i = 0; i < count; i++) {
          const expressionName = this._modelSetting.getExpressionName(i);
          const expressionFileName = this._modelSetting.getExpressionFileName(
            i
          );

          await fetch(`${this._modelHomeDir}${expressionFileName}`)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => {
              const motion: ACubismMotion = this.loadExpression(
                arrayBuffer,
                arrayBuffer.byteLength,
                expressionName
              );

              if (this._expressions.getValue(expressionName) != null) {
                ACubismMotion.delete(
                  this._expressions.getValue(expressionName)
                );
                this._expressions.setValue(expressionName, null);
              }

              this._expressions.setValue(expressionName, motion);

              this._expressionCount++;

              if (this._expressionCount >= count) {
                this._state = LoadStep.LoadPhysics;

                // callback
                loadCubismPhysics();
              }
            });
        }
        this._state = LoadStep.WaitLoadExpression;
      } else {
        this._state = LoadStep.LoadPhysics;

        // callback
        loadCubismPhysics();
      }
    };

    // Physics
    const loadCubismPhysics = async () => {
      if (this._modelSetting.getPhysicsFileName() != '') {
        const physicsFileName = this._modelSetting.getPhysicsFileName();

        await fetch(`${this._modelHomeDir}${physicsFileName}`)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => {
            this.loadPhysics(arrayBuffer, arrayBuffer.byteLength);

            this._state = LoadStep.LoadPose;

            // callback
            loadCubismPose();
          });
        this._state = LoadStep.WaitLoadPhysics;
      } else {
        this._state = LoadStep.LoadPose;

        // callback
        loadCubismPose();
      }
    };

    // Pose
    const loadCubismPose = async () => {
      if (this._modelSetting.getPoseFileName() != '') {
        const poseFileName = this._modelSetting.getPoseFileName();

        await fetch(`${this._modelHomeDir}${poseFileName}`)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => {
            this.loadPose(arrayBuffer, arrayBuffer.byteLength);

            this._state = LoadStep.SetupEyeBlink;

            // callback
            setupEyeBlink();
          });
        this._state = LoadStep.WaitLoadPose;
      } else {
        this._state = LoadStep.SetupEyeBlink;

        // callback
        setupEyeBlink();
      }
    };

    // EyeBlink
    const setupEyeBlink = () => {
      if (this._modelSetting.getEyeBlinkParameterCount() > 0) {
        this._eyeBlink = CubismEyeBlink.create(this._modelSetting);
        this._state = LoadStep.SetupBreath;
      }

      // callback
      setupBreath();
    };

    // Breath
    const setupBreath = (): void => {
      this._breath = CubismBreath.create();

      const breathParameters: csmVector<BreathParameterData> = new csmVector();
      breathParameters.pushBack(
        new BreathParameterData(this._idParamAngleX, 0.0, 15.0, 6.5345, 0.5)
      );
      breathParameters.pushBack(
        new BreathParameterData(this._idParamAngleY, 0.0, 8.0, 3.5345, 0.5)
      );
      breathParameters.pushBack(
        new BreathParameterData(this._idParamAngleZ, 0.0, 10.0, 5.5345, 0.5)
      );
      breathParameters.pushBack(
        new BreathParameterData(this._idParamBodyAngleX, 0.0, 4.0, 15.5345, 0.5)
      );
      breathParameters.pushBack(
        new BreathParameterData(
          CubismFramework.getIdManager().getId(
            CubismDefaultParameterId.ParamBreath
          ),
          0.0,
          0.5,
          3.2345,
          0.5
        )
      );

      this._breath.setParameters(breathParameters);
      this._state = LoadStep.LoadUserData;

      // callback
      loadUserData();
    };

    // UserData
    const loadUserData = async () => {
      if (this._modelSetting.getUserDataFile() != '') {
        const userDataFile = this._modelSetting.getUserDataFile();

        fetch(`${this._modelHomeDir}${userDataFile}`)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => {
            this.loadUserData(arrayBuffer, arrayBuffer.byteLength);

            this._state = LoadStep.SetupEyeBlinkIds;

            // callback
            setupEyeBlinkIds();
          });

        this._state = LoadStep.WaitLoadUserData;
      } else {
        this._state = LoadStep.SetupEyeBlinkIds;

        // callback
        setupEyeBlinkIds();
      }
    };

    // EyeBlinkIds
    const setupEyeBlinkIds = (): void => {
      const eyeBlinkIdCount: number = this._modelSetting.getEyeBlinkParameterCount();

      for (let i = 0; i < eyeBlinkIdCount; ++i) {
        this._eyeBlinkIds.pushBack(
          this._modelSetting.getEyeBlinkParameterId(i)
        );
      }

      this._state = LoadStep.SetupLipSyncIds;

      // callback
      setupLipSyncIds();
    };

    // LipSyncIds
    const setupLipSyncIds = (): void => {
      const lipSyncIdCount = this._modelSetting.getLipSyncParameterCount();

      for (let i = 0; i < lipSyncIdCount; ++i) {
        this._lipSyncIds.pushBack(this._modelSetting.getLipSyncParameterId(i));
      }
      this._state = LoadStep.SetupLayout;

      // callback
      setupLayout();
    };

    // Layout
    const setupLayout = (): void => {
      const layout: csmMap<string, number> = new csmMap<string, number>();
      this._modelSetting.getLayoutMap(layout);
      this._modelMatrix.setupFromLayout(layout);
      this._state = LoadStep.LoadMotion;

      // callback
      loadCubismMotion();
    };

    // Motion
    const loadCubismMotion = (): void => {
      this._state = LoadStep.WaitLoadMotion;
      this._model.saveParameters();
      this._allMotionCount = 0;
      this._motionCount = 0;
      const group: string[] = [];

      const motionGroupCount: number = this._modelSetting.getMotionGroupCount();


      // 求运动的总数
      for (let i = 0; i < motionGroupCount; i++) {
        group[i] = this._modelSetting.getMotionGroupName(i);
        this._allMotionCount += this._modelSetting.getMotionCount(group[i]);
      }


      // 动态的读取
      for (let i = 0; i < motionGroupCount; i++) {
        this.preLoadMotionGroup(group[i]);
      }

      // 没有动作的情况
      if (motionGroupCount == 0) {
        this._state = LoadStep.LoadTexture;

        // 停止所有动作
        this._motionManager.stopAllMotions();

        this._updating = false;
        this._initialized = true;

        this.createRenderer();
        this.setupTextures();
        this.getRenderer().startUp(gl);
      }
    };
  }

  /**
   * 在纹理单元中加载纹理
   */
  private setupTextures(): void {
    // 为了提高iPhone的alpha质量，Typescript采用premultipliedAlpha
    const usePremultiply = true;

    if (this._state == LoadStep.LoadTexture) {
      // 用于读取纹理
      const textureCount: number = this._modelSetting.getTextureCount();

      for (
        let modelTextureNumber = 0;
        modelTextureNumber < textureCount;
        modelTextureNumber++
      ) {
        // 如果纹理名称是空字符，跳过加载绑定处理
        if (this._modelSetting.getTextureFileName(modelTextureNumber) == '') {
          console.log('getTextureFileName null');
          continue;
        }

        // 在WebGL的纹理单元中加载纹理
        let texturePath = this._modelSetting.getTextureFileName(
          modelTextureNumber
        );
        texturePath = this._modelHomeDir + texturePath;

        // 加载完成时调用的回调函数
        const onLoad = (textureInfo: TextureInfo): void => {
          this.getRenderer().bindTexture(modelTextureNumber, textureInfo.id);

          this._textureCount++;

          if (this._textureCount >= textureCount) {
            // 加载完成
            this._state = LoadStep.CompleteSetup;
          }
        };

        // 读入
        HxpAgent.getInstance()
          .getTextureManager()
          .createTextureFromPngFile(texturePath, usePremultiply, onLoad);
        this.getRenderer().setIsPremultipliedAlpha(usePremultiply);
      }

      this._state = LoadStep.WaitLoadTexture;
    }
  }



  /**
   * 更新
   */
  public update() {
    if (this._state != LoadStep.CompleteSetup) return;

    // 增量时间
    const deltaTimeSeconds: number = HxpTimer.getDeltaTime();
    this._userTimeSeconds += deltaTimeSeconds;

    this._dragManager.update(deltaTimeSeconds);
    this._dragX = this._dragManager.getX();
    this._dragY = this._dragManager.getY();

    // 是否通过运动更新参数
    let motionUpdated = false;

    //--------------------------------------------------------------------------
    this._model.loadParameters(); // 载入上次被保存的状态
    if (this._motionManager.isFinished()) {
      // 在没有运动的回放的情况下，从待机运动中随机回放
      this.startRandomMotion(
        LAppDefine.MotionGroupIdle,
        LAppDefine.PriorityIdle
      );
    } else {

      motionUpdated = this._motionManager.updateMotion(
        this._model,
        deltaTimeSeconds
      ); // 更新动作

    }
    this._model.saveParameters(); // 保存状态
    //--------------------------------------------------------------------------

    // 眨眼
    if (!motionUpdated) {
      if (this._eyeBlink != null) {
        // 主动作没有更新的时候
        this._eyeBlink.updateParameters(this._model, deltaTimeSeconds); // 眨眼睛
      }
    }

    if (this._expressionManager != null) {
      this._expressionManager.updateMotion(this._model, deltaTimeSeconds); // 通过表情更新参数(相对变化)
    }

    // 药丸带来的变化
    // 通过药丸调整脸的朝向
    this._model.addParameterValueById(this._idParamAngleX, this._dragX * 30); // -30から30の値を加える
    this._model.addParameterValueById(this._idParamAngleY, this._dragY * 30);
    this._model.addParameterValueById(
      this._idParamAngleZ,
      this._dragX * this._dragY * -30
    );

    // 通过药丸调整身体的方向
    this._model.addParameterValueById(
      this._idParamBodyAngleX,
      this._dragX * 10
    ); // 从-10加上10的值

    // 通过药丸调整眼睛的方向
    this._model.addParameterValueById(this._idParamEyeBallX, this._dragX); // 从-1加上1的值
    this._model.addParameterValueById(this._idParamEyeBallY, this._dragY);

    // 呼吸等
    if (this._breath != null) {
      this._breath.updateParameters(this._model, deltaTimeSeconds);
    }

    // 物理运算的设定
    if (this._physics != null) {
      this._physics.evaluate(this._model, deltaTimeSeconds);
    }

    // 对口型的设定
    if (this._lipsync) {
      const value = 0.0; // 实时对口型时，从系统获取音量，并在0到1的范围内输入数值。


      for (let i = 0; i < this._lipSyncIds.getSize(); ++i) {
        this._model.addParameterValueById(this._lipSyncIds.at(i), value, 0.8);
      }
    }

    // 姿势的设定
    if (this._pose != null) {
      this._pose.updateParameters(this._model, deltaTimeSeconds);
    }

    this._model.update();
  }

  /**
   * 开始自变量指定的运动的再生
   * @param group 运动团体名称
   * @param no 组内的号码
   * @param priority priority
   * @param onFinishedMotionHandler 运动回放结束时调用的回调函数
   * @return 返回开始的运动的识别号码。作为判断单独运动是否结束的isFinished()的参数使用。不能开始的时候[-1]
   */
  public startMotion(
    group: string,
    no: number,
    priority: number,
    onFinishedMotionHandler?: FinishedMotionCallback
  ): CubismMotionQueueEntryHandle {
    if (priority == LAppDefine.PriorityForce) {
      this._motionManager.setReservePriority(priority);
      // 判断要执行的motion优先级是否高于当前执行的motion
    } else if (!this._motionManager.reserveMotion(priority)) {
      if (this._debugMode) {
        HxpTimer.printMessage("[APP]can't start motion.");
      }
      return InvalidMotionQueueEntryHandleValue;
    }

    const motionFileName = this._modelSetting.getMotionFileName(group, no);

    // ex) idle_0
    const name = `${group}_${no}`;
    let motion: CubismMotion = this._motions.getValue(name) as CubismMotion;
    let autoDelete = false;



    if (motion == null) {
      fetch(`${this._modelHomeDir}${motionFileName}`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          motion = this.loadMotion(
            arrayBuffer,
            arrayBuffer.byteLength,
            null,
            onFinishedMotionHandler
          );
          let fadeTime: number = this._modelSetting.getMotionFadeInTimeValue(
            group,
            no
          );

          motion.setIsLoop(true);

          if (fadeTime >= 0.0) {
            motion.setFadeInTime(fadeTime);
          }

          fadeTime = this._modelSetting.getMotionFadeOutTimeValue(group, no);
          if (fadeTime >= 0.0) {
            motion.setFadeOutTime(fadeTime);
          }

          motion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);
          autoDelete = true; // 结束时从内存中删除
        });
    } else {
      motion.setFinishedMotionHandler(onFinishedMotionHandler);
    }

    //voice
    const voice = this._modelSetting.getMotionSoundFileName(group, no);
    if (voice.localeCompare('') != 0) {
      let path = voice;
      path = this._modelHomeDir + path;
    }


    HxpTimer.printMessage(`[APP]start motion: [${group}_${no}`);

    return this._motionManager.startMotionPriority(
      motion,
      autoDelete,
      priority
    );
  }

  /**
   * 开始播放随机选择的运动。
   * @param group 运动团体名称
   * @param priority priority
   * @param onFinishedMotionHandler 运动回放结束时调用的回调函数
   * @return 返回开始的运动的识别号码。作为判断单独运动是否结束的isFinished()的参数使用。不能开始的时候[-1]
   */
  public startRandomMotion(
    group: string,
    priority: number,
    onFinishedMotionHandler?: FinishedMotionCallback
  ): CubismMotionQueueEntryHandle {
    if (this._modelSetting.getMotionCount(group) == 0) {
      return InvalidMotionQueueEntryHandleValue;
    }

    const no: number = Math.floor(
      Math.random() * this._modelSetting.getMotionCount(group)
    );

    return this.startMotion(group, no, priority, onFinishedMotionHandler);
  }

  /**
   * 设置由参数指定的表情动作
   *
   * @param expressionId 表情动作的ID
   */
  public setExpression(expressionId: string): void {
    const motion: ACubismMotion = this._expressions.getValue(expressionId);

    if (this._debugMode) {
      HxpTimer.printMessage(`[APP]expression: [${expressionId}]`);
    }

    if (motion != null) {
      this._expressionManager.startMotionPriority(
        motion,
        false,
        LAppDefine.PriorityForce
      );
    } else {
      if (this._debugMode) {
        HxpTimer.printMessage(`[APP]expression[${expressionId}] is null`);
      }
    }
  }

  /**
   * 设置随机选择的表情和动作
   */
  public setRandomExpression(): void {
    if (this._expressions.getSize() == 0) {
      return;
    }

    const no: number = Math.floor(Math.random() * this._expressions.getSize());

    for (let i = 0; i < this._expressions.getSize(); i++) {
      if (i == no) {
        const name: string = this._expressions._keyValues[i].first;
        this.setExpression(name);
        return;
      }
    }
  }

  /**
   * 接收事件的火花
   */
  public motionEventFired(eventValue: csmString): void {
    CubismLogInfo('{0} is fired on LAppModel!!', eventValue.s);
  }

  /**
   * 猜中测试
   * 根据指定ID的顶点列表计算矩形，判定坐标是否在矩形范围内。
   *
   * @param hitArenaName  测试是否正确的ID
   * @param x             进行判定的X坐标
   * @param y             进行判定的Y坐标
   */
  public hitTest(hitArenaName: string, x: number, y: number): boolean {
    // 透明时没有判定。
    if (this._opacity < 1) {
      return false;
    }

    const count: number = this._modelSetting.getHitAreasCount();

    for (let i = 0; i < count; i++) {
      if (this._modelSetting.getHitAreaName(i) == hitArenaName) {
        const drawId: CubismIdHandle = this._modelSetting.getHitAreaId(i);
        return this.isHit(drawId, x, y);
      }
    }

    return false;
  }

  /**
   * 从组名中统一载入运动数据。
   * 运动数据的名称在内部从ModelSetting获取。
   *
   * @param group 运动数据的组名
   */
  public preLoadMotionGroup(group: string): void {
    for (let i = 0; i < this._modelSetting.getMotionCount(group); i++) {
      const motionFileName = this._modelSetting.getMotionFileName(group, i);

      // ex) idle_0
      const name = `${group}_${i}`;
      if (this._debugMode) {
        HxpTimer.printMessage(
          `[APP]load motion: ${motionFileName} => [${name}]`
        );
      }

      fetch(`${this._modelHomeDir}${motionFileName}`)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => {
          const tmpMotion: CubismMotion = this.loadMotion(
            arrayBuffer,
            arrayBuffer.byteLength,
            name
          );


          let fadeTime = this._modelSetting.getMotionFadeInTimeValue(group, i);
          if (fadeTime >= 0.0) {
            tmpMotion.setFadeInTime(fadeTime);
          }

          fadeTime = this._modelSetting.getMotionFadeOutTimeValue(group, i);
          if (fadeTime >= 0.0) {
            tmpMotion.setFadeOutTime(fadeTime);
          }
          tmpMotion.setEffectIds(this._eyeBlinkIds, this._lipSyncIds);

          if (this._motions.getValue(name) != null) {
            ACubismMotion.delete(this._motions.getValue(name));
          }

          this._motions.setValue(name, tmpMotion);

          this._motionCount++;
          if (this._motionCount >= this._allMotionCount) {

            this._state = LoadStep.LoadTexture;

            // 停止所有动作
            this._motionManager.stopAllMotions();

            this._updating = false;
            this._initialized = true;

            this.createRenderer();
            this.setupTextures();
            this.getRenderer().startUp(gl);
          }
        });
    }
  }

  /**
   * 释放所有的运动数据。
   */
  public releaseMotions(): void {
    this._motions.clear();
  }

  /**
   * 释放所有的表情数据。
   */
  public releaseExpressions(): void {
    this._expressions.clear();
  }

  /**
   * 绘制模型的处理。传递绘制模型空间的View-Projection矩阵
   */
  public doDraw(): void {
    if (this._model == null) return;

    // 交给画布尺寸
    const viewport: number[] = [0, 0, canvas.width, canvas.height];

    this.getRenderer().setRenderState(frameBuffer, viewport);
    this.getRenderer().drawModel();
  }

  /**
   * 绘制模型的处理。传递绘制模型的空间View-Projection矩阵。
   */
  public draw(matrix: CubismMatrix44): void {
    if (this._model == null) {
      return;
    }

    // 每次读取结束后
    if (this._state == LoadStep.CompleteSetup) {
      matrix.multiplyByMatrix(this._modelMatrix);

      this.getRenderer().setMvpMatrix(matrix);

      this.doDraw();
    }
  }



  get _state() {
    return this.state;
  }

  // 观察模型加载进程
  set _state(index: number) {
    this.state = index;
  }


}
