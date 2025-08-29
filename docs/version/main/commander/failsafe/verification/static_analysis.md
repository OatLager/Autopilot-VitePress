# Failsafe Dynamic Analysis

## 1. 기능 구성 File/CLASS/Function 관계

### 1.1 파일 구조

- **failsafe.h**: 클래스 정의 및 인터페이스 선언
- **failsafe.cpp**: 클래스 구현 및 로직
- framework.h:
- framework.cpp:

### 1.2 클래스 관계도

```
Commander (src/modules/commander/Commander.hpp)
    └─ FailureDetector (failure_detector/FailureDetector.hpp)
        ├─ FailureInjector (내부 클래스)
        └─ ModuleParams (상속)
```

### 1.3 주요 구성 요소

- **FailureDetector**: 메인 클래스, 다양한 고장 탐지 로직 담당
- **FailureInjector**: 테스트용 고장 주입 클래스
- **failure_detector_status_u**: 고장 상태를 비트필드로 관리하는 union 구조체
- **uORB Subscriptions**: 센서 데이터 및 상태 정보 구독

### 1.4 메인 함수 호출 관계

```
Commander::run()
    ├─ FailureDetector::update() [주 진입점, Commander.cpp:1817]
    │   ├─ FailureInjector::update()
    │   ├─ FailureInjector::manipulateEscStatus()
    │   ├─ updateAttitudeStatus()
    │   ├─ updateEscsStatus()
    │   ├─ updateMotorStatus()
    │   └─ updateImbalancedPropStatus()
    └─ 상태 조회 함수들 [독립 호출]
        ├─ getStatus() [Commander.cpp:1818]
        ├─ getStatusFlags() [Commander.cpp:1915-1922]
        ├─ getImbalancedPropMetric() [Commander.cpp:1923]
        └─ getMotorFailures() [Commander.cpp:1924]
```

### 1.5 독립적 수행 함수

- **FailureDetector::update()**: Commander 모듈에서의 호출, 고장 탐지 기능 수행.
- **상태 조회 함수들**: Commander에서 고장 탐지 기능의 결과를 확인하기 위해 호출.

### 1.6 주요 시나리오 분류

1. **Attitude Failure 시나리오**: 자세 고장 탐지
2. **ESC Failure 시나리오**: ESC 고장 탐지
3. **Motor Failure 시나리오**: 모터 고장 탐지
4. **Vehicle Control Mode 시나리오**: 제어 모드 변경에 따른 탐지 활성화/비활성화
5. **Failure Injection 시나리오**: 테스트용 고장 주입

:::tip 상태 조회 함수들(getStatus, getStatusFlags, getImbalancedPropMetric, getMotorFailures)은 Commander에서 자동으로 호출되며 분기가 없어 100% 커버리지를 달성하므로 별도의 테스트 케이스가 필요하지 않음.
:::

## 2. 함수별 분기 확인

### 2.1 전체 분기 목록 요약 (수정됨)

:::details 전체 분기 목록 표

| No  | 함수명                       | 분기 ID | 레벨 | 라인    | 분기 조건                   | 설명                        |
| --- | ---------------------------- | ------- | ---- | ------- | --------------------------- | --------------------------- |
| 1   | getStatus()                  | -       | L0   | 103     | return _status              | 단순 반환                   |
| 2   | getStatusFlags()             | -       | L0   | 104     | return _status.flags        | 단순 반환                   |
| 3   | getImbalancedPropMetric()    | -       | L0   | 105     | return filter.getState()    | 필터 상태 반환              |
| 4   | getMotorFailures()           | -       | L0   | 106     | return mask_OR              | 비트 OR 연산                |
| 5   | FailureInjector::update()    | FI_U_01 | L1   | 49      | while(command_sub.update()) | 명령 수신 루프              |
| 6   | FailureInjector::update()    | FI_U_02 | L2   | 50      | cmd != INJECT_FAILURE       | 고장 주입 명령 확인         |
| 7   | FailureInjector::update()    | FI_U_03 | L2   | 61      | unit == SYSTEM_MOTOR        | 모터 시스템 단위 확인       |
| 8   | FailureInjector::update()    | FI_U_04 | L3   | 64      | type == FAILURE_TYPE_OK     | 정상 복구 명령              |
| 9   | FailureInjector::update()    | FI_U_05 | L4   | 69      | instance == 0               | 모든 모터 정상화            |
| 10  | FailureInjector::update()    | FI_U_06 | L5   | 72      | i < CONNECTED_ESC_MAX       | 정상화 루프                 |
| 11  | FailureInjector::update()    | FI_U_07 | L4   | 78      | instance in [1,MAX]         | 개별 모터 정상화            |
| 12  | FailureInjector::update()    | FI_U_08 | L3   | 87      | type == FAILURE_TYPE_OFF    | 모터 차단 명령              |
| 13  | FailureInjector::update()    | FI_U_09 | L4   | 92      | instance == 0               | 모든 모터 차단              |
| 14  | FailureInjector::update()    | FI_U_10 | L5   | 93      | i < CONNECTED_ESC_MAX       | 차단 루프                   |
| 15  | FailureInjector::update()    | FI_U_11 | L4   | 98      | instance in [1,MAX]         | 개별 모터 차단              |
| 16  | FailureInjector::update()    | FI_U_12 | L3   | 104     | type == FAILURE_TYPE_WRONG  | 잘못된 동작 명령            |
| 17  | FailureInjector::update()    | FI_U_13 | L4   | 109     | instance == 0               | 모든 모터 오동작            |
| 18  | FailureInjector::update()    | FI_U_14 | L5   | 110     | i < CONNECTED_ESC_MAX       | 오동작 루프                 |
| 19  | FailureInjector::update()    | FI_U_15 | L4   | 115     | instance in [1,MAX]         | 개별 모터 오동작            |
| 20  | FailureInjector::update()    | FI_U_16 | L2   | 122     | handled == true             | ACK 응답 전송               |
| 21  | manipulateEscStatus()        | FI_M_01 | L1   | 138     | blocked!=0 OR wrong!=0      | ESC 조작 활성화             |
| 22  | manipulateEscStatus()        | FI_M_02 | L2   | 141     | i < status.esc_count        | ESC 상태 조작 루프          |
| 23  | manipulateEscStatus()        | FI_M_03 | L3   | 144     | blocked & (1<<i_esc)        | ESC 차단 상태               |
| 24  | manipulateEscStatus()        | FI_M_04 | L3   | 150     | wrong & (1<<i_esc)          | ESC 오동작 상태             |
| 25  | FailureDetector::update()    | FD_U_01 | L1   | 173     | attitude_control_enabled    | 자세 제어 활성화            |
| 26  | FailureDetector::update()    | FD_U_02 | L1   | 187     | esc_status_sub.update()     | ESC 데이터 업데이트         |
| 27  | FailureDetector::update()    | FD_U_03 | L2   | 190     | param_escs_en.get()         | ESC 탐지 기능 활성화        |
| 28  | FailureDetector::update()    | FD_U_04 | L2   | 194     | param_actuator_en.get()     | 액추에이터 탐지 활성화      |
| 29  | FailureDetector::update()    | FD_U_05 | L1   | 199     | imb_prop_thr > 0            | 불균형 프로펠러 탐지 활성화 |
| 30  | updateAttitudeStatus()       | FD_A_01 | L1   | 210     | attitude_sub.update()       | 자세 데이터 업데이트        |
| 31  | updateAttitudeStatus()       | FD_A_02 | L2   | 217     | is_vtol_tailsitter          | VTOL 테일시터 확인          |
| 32  | updateAttitudeStatus()       | FD_A_03 | L3   | 218     | in_transition_mode          | 전환 모드 확인              |
| 33  | updateAttitudeStatus()       | FD_A_04 | L3   | 223     | type == FIXED_WING          | 고정익 모드 확인            |
| 34  | updateEscsStatus()           | FD_E_01 | L1   | 259     | arming_state == ARMED       | 시동 상태 확인              |
| 35  | updateEscsStatus()           | FD_E_02 | L2   | 266     | i < limited_esc_count       | ESC 고장 확인 루프          |
| 36  | updateEscsStatus()           | FD_E_03 | L3   | 267     | esc[i].failures > 0         | ESC 고장 카운터 확인        |
| 37  | updateImbalancedPropStatus() | FD_I_01 | L1   | 287     | sensor_selection.updated()  | 센서 선택 업데이트          |
| 38  | updateImbalancedPropStatus() | FD_I_02 | L2   | 290     | copy_selection_success      | 센서 선택 복사 성공         |
| 39  | updateImbalancedPropStatus() | FD_I_03 | L1   | 301     | accel_id != selected_id     | 가속도계 ID 불일치          |
| 40  | updateImbalancedPropStatus() | FD_I_04 | L2   | 303     | i < ORB_MULTI_MAX_INSTANCES | IMU 인스턴스 루프           |
| 41  | updateImbalancedPropStatus() | FD_I_05 | L3   | 304     | !ChangeInstance(i)          | IMU 인스턴스 변경 고장      |
| 42  | updateImbalancedPropStatus() | FD_I_06 | L3   | 308-309 | copy_success && id_match    | IMU 복사 성공 및 ID 일치    |
| 43  | updateImbalancedPropStatus() | FD_I_07 | L1   | 316     | updated_flag                | 업데이트 플래그 확인        |
| 44  | updateImbalancedPropStatus() | FD_I_08 | L2   | 318     | copy_final_imu_success      | 최종 IMU 복사 성공          |
| 45  | updateImbalancedPropStatus() | FD_I_09 | L3   | 320-321 | valid_id && id_match        | 유효 ID 및 일치 확인        |
| 47  | updateMotorStatus()          | FD_M_01 | L1   | 357     | arming_state == ARMED       | 시동 상태 확인              |
| 48  | updateMotorStatus()          | FD_M_02 | L2   | 364     | esc_idx < limited_count     | 모터 상태 루프              |
| 49  | updateMotorStatus()          | FD_M_03 | L3   | 371     | i_esc >= NUM_CONTROLS       | ESC 인덱스 범위 초과        |
| 50  | updateMotorStatus()          | FD_M_04 | L3   | 376     | !valid_mask && current>0    | 유효 전류 마스크 설정       |
| 51  | updateMotorStatus()          | FD_M_05 | L3   | 387     | valid && timeout && !flag   | ESC 타임아웃 발생           |
| 52  | updateMotorStatus()          | FD_M_06 | L3   | 391     | !timeout && flagged         | ESC 타임아웃 해제           |
| 53  | updateMotorStatus()          | FD_M_07 | L3   | 397     | current > FLT_EPSILON       | ESC 전류 유효성             |
| 54  | updateMotorStatus()          | FD_M_08 | L3   | 401     | has_current[i_esc]          | 전류 보고 이력 확인         |
| 55  | updateMotorStatus()          | FD_M_09 | L4   | 404     | ISFINITE(control[i])        | 제어 신호 유한성            |
| 56  | updateMotorStatus()          | FD_M_10 | L4   | 412     | throttle && low && !timeout | 전류 부족 복합 조건         |
| 57  | updateMotorStatus()          | FD_M_11 | L5   | 413     | start_time == 0             | 전류부족 시작시간 미설정    |
| 58  | updateMotorStatus()          | FD_M_12 | L5   | 418     | start_time != 0             | 전류부족 시작시간 설정됨    |
| 59  | updateMotorStatus()          | FD_M_13 | L4   | 423     | duration > threshold        | 전류부족 지속시간 초과      |
| 60  | updateMotorStatus()          | FD_M_14 | L2   | 435     | critical && !motor_flag     | 치명적 고장 발생            |
| 61  | updateMotorStatus()          | FD_M_15 | L2   | 439     | !critical && motor_flag     | 치명적 고장 해제            |
| 62  | updateMotorStatus()          | FD_M_16 | L2   | 446     | i_esc < NUM_CONTROLS        | 시동해제 시 초기화 루프     |
| ::: |                              |         |      |         |                             |                             |

### 2.2 FailureDetector 상태 조회 함수들 (HPP 인라인)

:::details 1. getStatus()

- **위치**: FailureDetector.hpp:103
- **분기 레벨**: 0단계 (단순 반환)
- **분기 조건**: 없음 (inline 함수, 단순 멤버변수 반환)
- **커버리지 요구사항**: Commander Module에서 호출
  :::

:::details 2. getStatusFlags()

- **위치**: FailureDetector.hpp:104
- **분기 레벨**: 0단계 (단순 반환)
- **분기 조건**: 없음 (inline 함수, _status.flags 반환)
- **커버리지 요구사항**: Commander Module에서 호출
  :::

:::details 3. getImbalancedPropMetric()

- **위치**: FailureDetector.hpp:105
- **분기 레벨**: 0단계
- **분기 조건**: 없음(_imbalanced_prop_lpf.getState() 호출, 결과 반환)
- **커버리지 요구사항**: Commander Module에서 호출
  :::

:::details 4. getMotorFailures()

- **위치**: FailureDetector.hpp:106
- **분기 레벨**: 0단계 (비트 연산)
- **분기 조건**: 없음 (단순 OR 연산 반환)
- **커버리지 요구사항**: Commander Module에서 호출
  :::

### 2.3 FailureInjector 함수

:::details 1. failsafe::fromNavDllOrRclActParam()

- **위치**: failsafe.cpp:45-133
- **분기 레벨**: 5단계 (중첩 if문 + for 루프)
- **커버리지 요구사항**: 16개 분기 만족

**분기 구조 분석:**

```
L1: switch (gcs_connection_loss_failsafe_mode(param_value))
    case Disabled:
    case Hold_mode:
    case Return_mode:
    case Land_mode:
    case Terminate:
    case Disarm:
    default:
```
| ID | Level | 분기 조건 | 설명 | 커버리지 요구사항 |
|:--:|:-----:|---------|-----|:----------------:|
| FS-01 | L1 | gcs_connection_loss_failsafe_mode::Disabled | GCS 연결 손실 비활성화 | True(case) 필요 |
| FS-02 | L1 | gcs_connection_loss_failsafe_mode::Hold_mode | Hold 모드 설정 | True(case) 필요 |
| FS-03 | L1 | gcs_connection_loss_failsafe_mode::Return_mode | Return 모드 설정 | True(case) 필요 |
| FS-04 | L1 | gcs_connection_loss_failsafe_mode::Land_mode | Land 모드 설정 | True(case) 필요 |
| FS-05 | L1 | gcs_connection_loss_failsafe_mode::Terminate | Terminate 액션 설정 | True(case) 필요 |
| FS-06 | L1 | gcs_connection_loss_failsafe_mode::Disarm | Disarm 액션 설정 | True(case) 필요 |
| FS-07 | L1 | default | 기본값 처리 | True(case) 필요 |


:::

## 4. 시험 환경 및 데이터 출처

### 4.1 하드웨어/소프트웨어 구성도

- **체계통합 시험 환경**: FMS HILS 환경 상에서 타겟 보드(전체 펌웨어 업로드) 운용.
- **SITL (Software In The Loop)**: Gazebo 시뮬레이션 환경
- **HITL (Hardware In The Loop)**: 실제 하드웨어와 시뮬레이션 조합

### 4.2 입력 데이터 출처

::: details Commander Module

- **vehicle_status**: Commander 모듈 - 상태 정보
- **vehicle_control_mode**: Commander 모듈 - 사용자 입력 및 자동조종장치 상태
  :::
  ::: details uORB MSG
- **vehicle_attitude**: uORB - IMU 센서 데이터 (시뮬레이션/실제 센서)
- **esc_status**: uORB - ESC 텔레메트리 (DShot/PWM 프로토콜)
- **sensor_selection**: uORB - 센서 선택 알고리즘 결과
- **vehicle_imu_status**:  uORB - IMU 상태 및 통계 정보
- **vehicle_command**: uORB - 비행체 명령
  :::
  ::: details Parameter
- **FD_FAIL_P**: 파라미터
- **FD_FAIL_R**: 파라미터
- **FD_FAIL_R_TTRI**: 파라미터
- **FD_FAIL_P_TTRI**: 파라미터
- **FD_ESCS_EN**: 파라미터
- **FD_IMB_PROP_THR**: 파라미터
- **FD_ACT_EN**: 파라미터
- **FD_ACT_MOT_THR**: 파라미터
- **FD_ACT_MOT_C2T**: 파라미터
- **FD_ACT_MOT_TOUT**: 파라미터
  :::

### 4.3 외부 조작 방법

- **MAVLink 명령**: GCS SW에서 명령 인가
- **Parameter 변경**: GCS SW에서 변경

### 4.4 출력 데이터

- **vehicle_command_ack**: uORB 비행체 명령 확인
- **로그 데이터**: failure_detector_status 확인
- **GCS SW**: GCS SW에서 출력되는 메시지 확인

### 4.5 권장사항

1. **Dynamic Testing**: COVER 분기들에 대해 운용 시나리오 기반 테스트 우선 수행
2. **Static Analysis**: STATIC 분기들에 대해 탐침코드를 통한 직접 검증 필요
3. **Coverage Tools**: gcov/lcov를 활용한 실제 코드 커버리지 측정 병행

## 5. 시나리오(Test Case) 수립 및 분기 커버 분류

### 5.1 COVER (시뮬레이션 가능) 시나리오

:::details TC-01 : 자세 고장 탐지

- **목적**: 기준치를 초과한 Roll/Pitch 자세 측정 시, 자세 고장 탐지 여부 확인

::: info **시험 입력자료**

- **입력 자료**

  - (commander) vehicle_status_vehicle_control_mode
  - (uORB) vehicle_attitude
  - (param) FD_FAIL_R, FD_FAIL_P
- **입력 값 실제자료 여부**

  - (commander) vehicle_status_vehicle_control_mode : 실제 자료
  - (uORB) vehicle_attitude : 실제 자료
  - (param) FD_FAIL_R, FD_FAIL_P : 실제 자료
- **시험입력 사용방법**

  - (commander) 통제 CSU에서 vehicle_status, vehicle_control_mode 자료 수신
  - (uORB) vehicle_attitude 구독을 통한 자세 자료 수신
  - (param) GCS SW에서 매개변수 값 입력
- **시험 입력 순서**

  - GCS SW에서 FD_FAIL_R '30' 값 입력
  - GCS SW에서 FD_FAIL_P '30' 값 입력
  - GCS SW에서 FD_FAIL_R_TTRI '0.3' 값 입력
  - GCS SW에서 FD_FAIL_P_TTRI '0.3' 값 입력
  - FMS 조작을 통한 vehicle_attitude (roll/pitch) 값 '30' 이상 입력

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 FD_FAIL_R '30' 값 입력
3. GCS SW에서 FD_FAIL_P '30' 값 입력
4. GCS SW에서 FD_FAIL_R_TTRI '0.3' 값 입력
5. GCS SW에서 FD_FAIL_P_TTRI '0.3' 값 입력
6. FMS 조작을 통한 vehicle_attitude (roll/pitch) 값 '0' 입력
7. GCS SW에서 listener failure_detector_status로 fd_roll, fd_pitch 상태 False 확인
8. FMS 조작을 통한 vehicle_attitude (roll/pitch) 값 '40/0' 입력
9. GCS SW에서 listener failure_detector_status로 fd_roll = True, fd_pitch = False 확인
10. FMS 조작을 통한 vehicle_attitude (roll/pitch) 값 '40/40' 입력
11. GCS SW에서 listener failure_detector_status로 fd_roll = True, fd_pitch = True 확인
12. FMS 조작을 통한 vehicle_attitude (roll/pitch) 값 '0/40' 입력
13. GCS SW에서 listener failure_detector_status로 fd_roll = False, fd_pitch = True 확인
14. GCS SW에서 FCS의 로그 기록 종료
15. FCS 전원 해제

::: info **시험 예상결과**

- **시험결과 출력 자료**

  - 로그 자료/GCS SW에서 failure_detector_status.fd_roll = 1(True) 값 이력 확인
  - 로그 자료/GCS SW에서 failure_detector_status.fd_pitch = 1(True) 값 이력 확인
- **시험결과 승인 범위**

  - failure_detector_status.fd_roll: 0 or 1 (false/true)
  - failure_detector_status.fd_pitch: 0 or 1 (false/true)
- **시험결과 입출력 조건**

  1. vehicle_attitude : roll < 30(deg), pitch < 30(deg)

  - fd_roll = 0, fd_pitch = 0

  2. vehicle_attitude : roll > 30(deg), pitch < 30(deg)

  - fd_roll = 1, fd_pitch = 0

  3. vehicle_attitude : roll < 30(deg), pitch > 30(deg)

  - fd_roll = 0, fd_pitch = 1

  4. vehicle_attitude : roll > 30(deg), pitch > 30(deg)

  - fd_roll = 1, fd_pitch = 1

:::

### 5.2 STATIC (탐침코드 필요) 분기

::: details ST-01 :  IMU Device Selection Loop

- **해당 분기**: FD_I_04, FD_I_05, FD_I_06
- **위치**: updateImbalancedPropStatus():303-313
- **고장 조건**: 선택된 가속도계 장치 ID와 불일치
- **검증 불가 이유**: ORB_MULTI_MAX_INSTANCES 반복 로직의 모든 케이스를 시뮬레이션에서 재현 어려움
- **탐침코드 필요**: IMU 인스턴스별 device_id 강제 설정
  :::
  ::: details ST-02 : ESC Current Validation Edge Cases
- **해당 분기**: FD_M_04
- **위치**: updateMotorStatus():376-378
- **고장 조건**: ESC 전류 값이 정확히 0.0f인 경우
- **검증 불가 이유**: SITL에서 정확한 전류 0 상태 시뮬레이션 제한
- **탐침코드 필요**: ESC 전류 값 강제 설정
  :::
  ::: details ST-03 : Memory Allocation Failures
- **해당 분기**: FD_I_02, FD_I_06, FD_I_08
- **위치**: 모든 uORB copy() 작업
- **고장 조건**: uORB 메모리 할당 고장
- **검증 불가 이유**: 시뮬레이션에서 메모리 부족 상황 재현 어려움
- **탐침코드 필요**: uORB copy 고장 시뮬레이션
  :::
  ::: details ST-04 : Motor Control Signal Validation
- **해당 분기**: FD_M_09
- **위치**: updateMotorStatus():404-406
- **고장 조건**: actuator_motors.control[i_esc]가 무한대/NaN인 경우
- **검증 불가 이유**: 정상적인 비행 제어에서 무한대 값 발생 어려움
- **탐침코드 필요**: actuator_motors 제어 신호 직접 조작
  :::
  ::: details ST-05 : Undercurrent Timer Edge Cases
- **해당 분기**: FD_M_11, FD_M_12
- **위치**: updateMotorStatus():413-429
- **고장 조건**: 전류 부족 타이머의 정확한 시작/리셋 타이밍
- **검증 불가 이유**: 정밀한 시간 제어와 전류 임계값의 복합 조건 테스트 어려움
- **탐침코드 필요**: 타이머 변수 및 전류 값 직접 조작
  :::

### 5.3 분기 커버리지 요약

| 함수명                       | 분기 ID 범위        | 총 분기      | COVER        | STATIC      | 커버리지(%)   |
| ---------------------------- | ------------------- | ------------ | ------------ | ----------- | ------------- |
| getStatus()                  | -                   | 1            | 1            | 0           | 100%          |
| getStatusFlags()             | -                   | 1            | 1            | 0           | 100%          |
| getImbalancedPropMetric()    | -                   | 1            | 1            | 0           | 100%          |
| getMotorFailures()           | -                   | 1            | 1            | 0           | 100%          |
| FailureInjector::update()    | FI_U_01~16          | 16           | 16           | 0           | 100%          |
| manipulateEscStatus()        | FI_M_01~04          | 4            | 4            | 0           | 100%          |
| FailureDetector::update()    | FD_U_01~05          | 5            | 5            | 0           | 100%          |
| updateAttitudeStatus()       | FD_A_01~04          | 4            | 4            | 0           | 100%          |
| updateEscsStatus()           | FD_E_01~03          | 3            | 3            | 0           | 100%          |
| updateImbalancedPropStatus() | FD_I_01~09          | 9            | 6            | 3           | 67%           |
| updateMotorStatus()          | FD_M_01~16          | 16           | 14           | 2           | 88%           |
| **전체**               | **62개 분기** | **62** | **57** | **5** | **92%** |
