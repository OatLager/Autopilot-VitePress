# Module : WorkQueue
::: info 문서 개요
WorkQueue 방식을 사용하는 모듈을 추가하는 방법을 단계별로 설명합니다. 소스 코드 작성부터 빌드 시스템 통합, 런타임 시작까지 전체 과정을 다룹니다.
:::

## 1. 사용자 모듈 추가: WorkItem
### 1.1 기본 요구사항
:::info
모듈 개발 시 필요한 기본 구조와 체크리스트를 제공합니다. 소스 코드 위치, 필수 파일들, 실행 방식 선택 가이드를 다룹니다.
:::

#### 1.1.1 소스 코드 위치
```
src/
├── modules/
│   └── your_module_name/          # 표준 모듈 위치
│       ├── CMakeLists.txt
│       ├── Kconfig                # 모듈 설정 옵션 정의
│       ├── your_module.cpp
│       └── your_module.hpp
├── examples/
│   └── your_example/              # 예제/테스트용 모듈
└── drivers/
    └── your_driver/               # 하드웨어 드라이버 모듈
```

#### 1.1.2 모듈 추가 체크리스트
    1. CMakeLists.txt: 빌드 시스템에 모듈 등록
    2. config: 설정 옵션 추가 (모듈 활성화용)
    3. 모듈 클래스: ModuleBase, ModuleParams, WorkItem 상속
    4. 워크큐 설정: 적절한 우선순위와 실행 방식 선택
    5. uORB 토픽: 필요시 새로운 메시지 타입 정의
    6. 초기화 스크립트: 자동 시작 설정

#### 1.1.3 모듈 실행 방식 선택 가이드
모듈의 특성에 따라 적절한 실행 방식을 선택:
- 실시간 제어 모듈 : `rate_ctrl` 워크큐 + 이벤트 기반 (IMU 토픽 구독)
- 일반 제어 모듈 : `att_pos_ctrl` 워크큐 + 이벤트 기반
- 항법/미션 모듈 : `nav_and_controllers` 워크큐 + 주기적 또는 이벤트 기반
- 센서 드라이버 : `lp_default` 워크큐 + 주기적 실행
- 통신/로깅 : `lp_default` 워크큐 + 저빈도 주기적 실행

* 자세한 WorkQueue 시스템과 실행 방식은 **3.2 WorkQueue 시스템 구조**를 참조하세요.

---

### 1.2 모듈 활성화 방법
:::info
작성한 모듈을 실제로 PX4 펌웨어에 포함시키고 실행하는 방법을 설명합니다. Kconfig를 통한 빌드 시 포함과 초기화 스크립트를 통한 런타임 시작을 다룹니다.
:::

#### 1.2.1 Kconfig 시스템을 통한 빌드 시 활성화
**Kconfig 시스템 개요**
PX4는 Linux 커널과 동일한 Kconfig 시스템을 사용하여 빌드 시 모듈을 선택적으로 포함합니다.
`src/modules/Kconfig`에서 `rsource "*/Kconfig"`로 모든 모듈의 설정을 자동 포함하여 통합 관리합니다.

1. **모듈별 Kconfig 파일 생성**
- 파일 위치: `src/modules/your_module/Kconfig`

모듈 폴더에 Kconfig 파일을 생성하여 설정 옵션 정의
```bash
# src/modules/your_module/Kconfig
menuconfig MODULES_YOUR_MODULE
    bool "your_module"
    default n
    ---help---
        Enable support for your_module
```

- **default n**: 보드 설정 파일에서 `CONFIG_MODULES_YOUR_MODULE=y`로 명시적 활성화 필요
- **default y**: 보드 설정 파일에 명시하지 않아도 빌드 시 자동 포함

2. **보드별 설정 파일에서 활성화**
**파일 위치 예시**:
- `boards/px4/fmu-v6x/default.px4board` (일반용)
- `boards/px4/fmu-v6x/multicopter.px4board` (멀티콥터 전용)
- `boards/px4/sitl/default.px4board` (시뮬레이션용)
- `boards/holybro/durandal-v1/default.px4board` (Holybro Durandal)
- `boards/cuav/x7pro/default.px4board` (CUAV X7Pro)

보드 설정 파일에서 모듈을 활성화
```bash
  # boards/px4/fmu-v6x/default.px4board
  CONFIG_MODULES_YOUR_MODULE=y        # 사용자 모듈 포함
  CONFIG_MODULES_MC_RATE_CONTROL=y    # mc_rate_control 모듈 포함
  CONFIG_MODULES_COMMANDER=y          # commander 모듈 포함
  CONFIG_MODULES_SENSORS=y            # sensors 모듈 포함
```

#### 1.2.2 초기화 스크립트를 통한 런타임 시작
빌드에 포함된 모듈을 런타임에 시작하려면 다음 스크립트에 추가
- Multicopter : `ROMFS/px4fmu_common/init.d/rc.mc_apps`
- Fixed Wing : `ROMFS/px4fmu_common/init.d/rc.fw_apps`
- VTOL : `ROMFS/px4fmu_common/init.d/rc.vtol_apps`
- 공통 : `ROMFS/px4fmu_common/init.d/rcS`

**예시:**`rc.mc_apps`에 사용자 모듈 추가
```bash
# 기존 모듈들
mc_rate_control start
mc_att_control start
...
# 사용자 모듈 추가
your_module start
```


## 2. WorkQueue Module
:::info
모든 WorkQueue 모듈이 따라야 하는 기본 클래스 구조와 필수 구현 요소들을 설명합니다.

ModuleBase, WorkItem, (ModuleParams) 클래스 상속과 필수 메소드들을 다룹니다.
:::

### 2.1. 모듈 클래스 상속 구조
WorkQueue의 모든 모듈은 다음과 같은 기본 클래스들을 상속받습니다

#### 2.1.1. ModuleBase 필수 정적 메소드 구현

- **파일 참조**: `platforms/common/include/px4_platform_common/module.h:75-112`

```cpp
// 1. 모듈 생성 및 시작 (필수)
static int task_spawn(intargc, char*argv[]);
// 2. 사용자 명령 처리 (필수)
static int custom_command(intargc, char*argv[]);
// 3. 사용법 출력 (필수)
static int print_usage(constchar*reason = nullptr);
```

- **이유**: ModuleBase는 CRTP(Curiously Recurring Template Pattern)를 사용하여 정적 다형성을 제공합니다. `ModuleBase::main()`에서 이 메소드들을 호출하므로 반드시 구현해야 합니다.


#### 2.1.2. WorkItem 필수 순수 가상 함수 구현

- **파일 참조**: `platforms/common/include/px4_platform_common/px4_work_queue/WorkItem.hpp:112`

```cpp
// Run() 함수 - 순수 가상 함수 (필수)
virtual void Run() = 0;
```

- **이유**: WorkItem의 핵심 실행 로직입니다. WorkQueue에서 모듈이 스케줄될 때 호출되는 메인 함수로, 구현하지 않으면 컴파일 에러가 발생합니다.
- **컴파일 에러 예시**:

```cpp
// Run() 미구현 시 컴파일 에러
error: cannot declare variable 'obj' to be of abstract type 'YourModule'
note: virtual void px4::WorkItem::Run() [pure virtual]
```

---


### 1.2. 기본 모듈 템플릿 구조

```cpp
class YourModule : public ModuleBase<YourModule>,
                   public ModuleParams,
                   public px4::WorkItem
{
public:
    YourModule();
    ~YourModule() override;

    static int task_spawn(int argc, char*argv[]);
    static int custom_command(int argc, char*argv[]);
    static int print_usage(const char*reason = nullptr);

    bool init();

private:
    void Run() override;

    // uORB 구독자들
    uORB::Subscription _param_sub{ORB_ID(parameter_update)};
    uORB::SubscriptionCallbackWorkItem _input_sub{this, ORB_ID(input_topic)};
    // uORB 발행자들
    uORB::Publication<output_topic_s> _output_pub{ORB_ID(output_topic)};

    void parameters_updated();
};
```
