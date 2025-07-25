# Build Sequence

::: info 문서 개요
빌드 명령어를 실행했을 때, Autopilot Firmware가 어떤 과정을 거쳐 빌드되는지 종합적으로 정리한 문서입니다.
:::

## 1. 빌드 과정

### 1.1. 요약

**빌드 과정의 핵심 파일들:**
  - **최상위 `Makefile`** - `make` 명령어의 시작점
  - **루트 `CMakeLists.txt`** - 전체 빌드 설정의 마스터 플랜
  - **`platforms/nuttx/CMakeLists.txt`** - 운영체제(NuttX) 빌드 설정
  - **`boards/px4/fmu-v6x/default.cmake`** - 타겟 보드별 세부 설정


**빌드 순서:**
1. **설정(CMake)** - `make`가 `cmake`를 호출하여 빌드 환경 구성 및 `build.ninja` 파일 생성
2. **컴파일(Ninja)** - `ninja`가 소스 코드를 컴파일하고 링크하여 `px4.elf` 파일 생성
3. **펌웨어 변환** - `px4.elf` 파일을 `px4_fmu-v6x_default.px4` 펌웨어 파일로 변환

---

### 1.2. 상세 빌드 과정

#### Step 01 : `make` 명령어 실행 및 CMake 호출

1. **빌드 시작**<br>
   사용자가 터미널에 `make px4_fmu-v6x_default`를 입력하면, 프로젝트 루트 디렉토리의 `Makefile`이 가장 먼저 실행됩니다. 이 `Makefile`은 **CMake를 올바른 설정으로 실행시켜주는 래퍼(wrapper) 스크립트** 역할을 합니다.
2. **보드 설정**<br>
   `px4_fmu-v6x_default` 이름을 분석하여 `PX4_BOARD` 변수를 설정합니다.
3. **CMake 실행**<br>
   이 보드 설정을 가지고 `cmake` 명령을 실행하여 빌드 디렉토리(`build/px4_fmu-v6x_default/`)에 빌드 환경을 구성합니다.

    ::: info CMake 빌드 계획 수립
    이 과정에서 `CMake`는 루트 **`CMakeLists.txt`**를 시작으로, `PX4_BOARD` 설정에 따라 관련된 모든 `CMakeLists.txt`와 `.cmake` 파일들을 연쇄적으로 포함하며 전체 빌드 계획을 세웁니다. 이 계획의 최종 산출물은 `make`가 아닌 **`ninja`**라는 더 빠른 빌드 도구가 사용할 `build.ninja` 파일입니다.
    :::


#### Step 02 : 컴파일 및 링크 (Ninja 실행)

1. CMake가 `build.ninja` 파일을 생성하고 나면, `ninja` 명령어가 실행되어 실제 컴파일을 시작합니다.

    ::: info
    **크로스 컴파일**: PC(x86)가 아닌 ARM Cortex-M7 MCU에서 동작하는 코드를 만들어야 하므로, **ARM용 크로스 컴파일러**(예: `arm-none-eabi-gcc`)를 사용합니다.
    :::

2. **오브젝트 파일 생성**: `ninja`는 `build.ninja` 파일의 지시에 따라 수백 개의 `.c`와 `.cpp` 소스 파일들을 각각 컴파일하여 `.o` 오브젝트 파일로 만듭니다.
3. **ELF 파일 생성**: 모든 오브젝트 파일과 라이브러리들을 **링커(Linker)**가 하나로 묶어 **`px4.elf`** 라는 단일 실행 파일을 만듭니다.

#### Step 03 : 펌웨어 파일(.px4) 생성

  ::: warning ELF 파일에서 펌웨어 변환 필수
  `px4.elf` 파일은 개발용 파일입니다. 실제 비행 컨트롤러의 부트로더가 읽을 수 있는 최종 펌웨어 파일로 변환해야 합니다.
  :::

1. **변환**: `objcopy` 같은 도구를 사용하여 `px4.elf` 파일에서 순수한 실행 코드 부분만 추출하여 바이너리 파일로 만듭니다.
2. **메타데이터 추가 및 압축**: 이 바이너리 파일에 보드 ID, 펌웨어 버전 같은 메타데이터를 추가하고 압축하여 최종적으로 **`px4_fmu-v6x_default.px4`** 파일을 생성합니다.
