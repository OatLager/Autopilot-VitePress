# Failsafe Dynamic Analysis

## 1. 기능 구성 File/CLASS/Function 관계

### 1.1 파일 구조

- **failsafe.h**: Failsafe 클래스 정의 및 인터페이스 선언
- **failsafe.cpp**: Failsafe 클래스 구현 및 로직
- **framework.h**: FailsafeBase 기본 프레임워크 클래스 정의
- **framework.cpp**: FailsafeBase 프레임워크 구현

### 1.2 클래스 관계도

```
Commander (src/modules/commander/Commander.hpp)
    └─ Failsafe (failsafe/failsafe.h)
        ├─ FailsafeBase (framework.h) [상속]
        │   └─ ModuleParams [상속]
        └─ 각종 enum 클래스들
            ├─ LowBatteryAction
            ├─ offboard_loss_failsafe_mode
            ├─ actuator_failure_failsafe_mode
            ├─ geofence_violation_action
            └─ 기타 failsafe 모드들
```

### 1.3 주요 구성 요소

- **Failsafe**: 메인 클래스, PX4 특화 failsafe 로직 구현
- **FailsafeBase**: 기본 프레임워크, 공통 failsafe 동작 제공
- **Action enum**: failsafe 액션 정의 (None, Warn, Hold, RTL, Land, Terminate 등)
- **ActionOptions struct**: 각 failsafe 조건에 대한 액션 옵션
- **State struct**: 드론의 현재 상태 정보

### 1.4 메인 함수 호출 관계

```
Commander::run()
    ├─ Failsafe::update() [주 진입점]
    │   ├─ FailsafeBase::update() [framework.cpp:53]
    │   │   ├─ checkStateAndMode() [가상함수, failsafe.cpp에서 구현]
    │   │   ├─ removeNonActivatedActions()
    │   │   ├─ getSelectedAction()
    │   │   ├─ updateStartDelay()
    │   │   └─ notifyUser()
    │   └─ Failsafe::checkStateAndMode() [failsafe.cpp:398]
    │       ├─ updateArmingState()
    │       ├─ CHECK_FAILSAFE 매크로 호출들
    │       │   ├─ manual_control_signal_lost 검사
    │       │   ├─ gcs_connection_lost 검사
    │       │   ├─ battery_warning 검사
    │       │   ├─ geofence_breached 검사
    │       │   ├─ mission_failure 검사
    │       │   ├─ fd_critical_failure 검사
    │       │   ├─ wind_limit_exceeded 검사
    │       │   └─ flight_time_limit_exceeded 검사
    │       └─ checkModeFallback() [모드 폴백 검사]
    └─ 상태 조회 함수들 [독립 호출]
        ├─ selectedAction()
        ├─ inFailsafe()
        └─ userTakeoverActive()
```

### 1.5 독립적 수행 함수

- **FailsafeBase::update()**: Commander 모듈에서 호출, 전체 failsafe 상태 머신 업데이트
- **상태 조회 함수들**: Commander에서 현재 failsafe 상태 확인용
- **Static 변환 함수들**: 파라미터 값을 ActionOptions로 변환

### 1.6 주요 시나리오 분류

1. **Manual Control Loss 시나리오**: RC 신호 손실 처리
2. **GCS Connection Loss 시나리오**: 지상 제어소 연결 손실 처리
3. **Battery Warning 시나리오**: 배터리 경고/위험/응급 상태 처리
4. **Geofence Violation 시나리오**: 지오펜스 위반 처리
5. **Mission Failure 시나리오**: 미션 실패 처리
6. **Critical System Failure 시나리오**: 중요 시스템 고장 처리
7. **Wind/Flight Time Limit 시나리오**: 바람/비행시간 제한 초과 처리
8. **Mode Fallback 시나리오**: 모드 폴백 처리
9. **User Takeover 시나리오**: 사용자 수동 접수 처리

:::tip 상태 조회 함수들(selectedAction, inFailsafe, userTakeoverActive)은 Commander에서 자동으로 호출되며 분기가 없어 100% 커버리지를 달성하므로 별도의 테스트 케이스가 필요하지 않음.
:::

## 2. 함수별 분기 확인

### 2.1 전체 분기 목록 요약

:::details 전체 분기 목록 표

| No | 함수명                        | 분기 ID | 레벨 | 라인 | 분기 조건                                                     | 설명                           |
| -- | ----------------------------- | ------- | ---- | ---- | ------------------------------------------------------------- | ------------------------------ |
| 1  | selectedAction()              | -       | L0   | 152  | return _selected_action                                       | 단순 반환                      |
| 2  | inFailsafe()                  | -       | L0   | 150  | return (_selected_action != None && _selected_action != Warn) | 단순 비교 반환                 |
| 3  | userTakeoverActive()          | -       | L0   | 156  | return _user_takeover_active                                  | 단순 반환                      |
| 4  | fromNavDllOrRclActParam()     | FS_N_01 | L1   | 47   | switch(gcs_connection_loss_failsafe_mode)                     | GCS 연결손실 모드 분기         |
| 5  | fromNavDllOrRclActParam()     | FS_N_02 | L2   | 48   | case Disabled                                                 | 비활성화 케이스                |
| 6  | fromNavDllOrRclActParam()     | FS_N_03 | L2   | 52   | case Hold_mode                                                | Hold 모드 케이스               |
| 7  | fromNavDllOrRclActParam()     | FS_N_04 | L2   | 56   | case Return_mode                                              | Return 모드 케이스             |
| 8  | fromNavDllOrRclActParam()     | FS_N_05 | L2   | 61   | case Land_mode                                                | Land 모드 케이스               |
| 9  | fromNavDllOrRclActParam()     | FS_N_06 | L2   | 65   | case Terminate                                                | Terminate 케이스               |
| 10 | fromNavDllOrRclActParam()     | FS_N_07 | L2   | 71   | case Disarm                                                   | Disarm 케이스                  |
| 11 | fromNavDllOrRclActParam()     | FS_N_08 | L2   | 76   | default                                                       | 기본 케이스                    |
| 12 | fromGfActParam()              | FS_G_01 | L1   | 88   | switch(geofence_violation_action)                             | 지오펜스 위반 액션 분기        |
| 13 | fromGfActParam()              | FS_G_02 | L2   | 89   | case None                                                     | 액션 없음 케이스               |
| 14 | fromGfActParam()              | FS_G_03 | L2   | 93   | case Warning                                                  | 경고만 케이스                  |
| 15 | fromGfActParam()              | FS_G_04 | L2   | 97   | case Hold_mode                                                | Hold 모드 케이스               |
| 16 | fromGfActParam()              | FS_G_05 | L2   | 103  | case Return_mode                                              | Return 모드 케이스             |
| 17 | fromGfActParam()              | FS_G_06 | L2   | 108  | case Terminate                                                | Terminate 케이스               |
| 18 | fromGfActParam()              | FS_G_07 | L2   | 114  | case Land_mode                                                | Land 모드 케이스               |
| 19 | fromGfActParam()              | FS_G_08 | L2   | 118  | default                                                       | 기본 케이스                    |
| 20 | fromImbalancedPropActParam()  | FS_I_01 | L1   | 130  | switch(imbalanced_propeller_failsafe_mode)                    | 불균형 프로펠러 모드 분기      |
| 21 | fromImbalancedPropActParam()  | FS_I_02 | L2   | 131  | case Disabled/default                                         | 비활성화/기본 케이스           |
| 22 | fromImbalancedPropActParam()  | FS_I_03 | L2   | 136  | case Warning                                                  | 경고 케이스                    |
| 23 | fromImbalancedPropActParam()  | FS_I_04 | L2   | 140  | case Return                                                   | Return 케이스                  |
| 24 | fromImbalancedPropActParam()  | FS_I_05 | L2   | 145  | case Land                                                     | Land 케이스                    |
| 25 | fromActuatorFailureActParam() | FS_A_01 | L1   | 158  | switch(actuator_failure_failsafe_mode)                        | 액추에이터 고장 모드 분기      |
| 26 | fromActuatorFailureActParam() | FS_A_02 | L2   | 159  | case Warning_only/default                                     | 경고만/기본 케이스             |
| 27 | fromActuatorFailureActParam() | FS_A_03 | L2   | 164  | case Hold_mode                                                | Hold 모드 케이스               |
| 28 | fromActuatorFailureActParam() | FS_A_04 | L2   | 168  | case Land_mode                                                | Land 모드 케이스               |
| 29 | fromActuatorFailureActParam() | FS_A_05 | L2   | 173  | case Return_mode                                              | Return 모드 케이스             |
| 30 | fromActuatorFailureActParam() | FS_A_06 | L2   | 178  | case Terminate                                                | Terminate 케이스               |
| 31 | fromBatteryWarningActParam()  | FS_B_01 | L1   | 191  | switch(battery_warning)                                       | 배터리 경고 레벨 분기          |
| 32 | fromBatteryWarningActParam()  | FS_B_02 | L2   | 192  | default/case BATTERY_WARNING_NONE                             | 기본/경고없음 케이스           |
| 33 | fromBatteryWarningActParam()  | FS_B_03 | L2   | 197  | case BATTERY_WARNING_LOW                                      | 배터리 LOW 경고 케이스         |
| 34 | fromBatteryWarningActParam()  | FS_B_04 | L2   | 201  | case BATTERY_WARNING_CRITICAL                                 | 배터리 CRITICAL 경고 케이스    |
| 35 | fromBatteryWarningActParam()  | FS_B_05 | L2   | 208  | case BATTERY_WARNING_EMERGENCY                                | 배터리 EMERGENCY 경고 케이스   |
| 36 | fromBatteryWarningActParam()  | FS_B_06 | L3   | 215  | if(param_value == ReturnOrLand)                               | ReturnOrLand 파라미터 확인     |
| 37 | fromBatteryWarningActParam()  | FS_B_07 | L4   | 216  | if(battery_warning == CRITICAL)                               | CRITICAL 레벨에서 Return 판단  |
| 38 | checkStateAndMode()           | FS_C_01 | L1   | 412  | if(!manual_control_signal_lost)                               | 수동 제어 신호 정상            |
| 39 | checkStateAndMode()           | FS_C_02 | L1   | 417  | if(rc_loss_ignored_mission)                                   | 미션모드 RC 손실 무시 조건     |
| 40 | checkStateAndMode()           | FS_C_03 | L1   | 419  | if(rc_loss_ignored_loiter)                                    | 로이터모드 RC 손실 무시 조건   |
| 41 | checkStateAndMode()           | FS_C_04 | L1   | 421  | if(rc_loss_ignored_offboard)                                  | 오프보드모드 RC 손실 무시 조건 |
| 42 | checkStateAndMode()           | FS_C_05 | L1   | 423  | if(rc_loss_ignored_takeoff)                                   | 이륙모드 RC 손실 무시 조건     |
| 43 | checkStateAndMode()           | FS_C_06 | L1   | 429  | if(rc_in_mode != StickInputDisabled && !rc_loss_ignored)      | RC 입력 활성화 및 무시 안됨    |
| 44 | checkStateAndMode()           | FS_C_07 | L1   | 435  | if(gcs_connection_loss_ignored)                               | GCS 연결손실 무시 조건         |
| 45 | checkStateAndMode()           | FS_C_08 | L1   | 438  | if(nav_dll_act != Disabled && !gcs_connection_loss_ignored)   | GCS 연결손실 처리 활성화       |
| 46 | checkStateAndMode()           | FS_C_09 | L1   | 444  | if(user_intended_mode in AUTO modes)                          | VTOL 쿼드츄트 대상 모드 확인   |
| 47 | checkStateAndMode()           | FS_C_10 | L1   | 452  | if(user_intended_mode == AUTO_MISSION)                        | 미션 모드 확인                 |
| 48 | checkStateAndMode()           | FS_C_11 | L2   | 457  | if(rc_disabled && gcs_disabled && mission_finished)           | 양방향 제어 손실 및 미션 완료  |
| 49 | checkStateAndMode()           | FS_C_12 | L1   | 470  | if(user_intended_mode in AUTO modes)                          | 위치 정확도 검사 대상 모드     |
| 50 | checkStateAndMode()           | FS_C_13 | L1   | 482  | if(armed_time != 0 && time < armed_time + spoolup_time)       | 스풀업 시간 내 배터리 체크     |
| 51 | checkStateAndMode()           | FS_C_14 | L1   | 492  | switch(battery_warning)                                       | 배터리 경고 레벨 분기          |
| 52 | checkStateAndMode()           | FS_C_15 | L2   | 493  | case BATTERY_WARNING_LOW                                      | 배터리 LOW 경고 처리           |
| 53 | checkStateAndMode()           | FS_C_16 | L2   | 498  | case BATTERY_WARNING_CRITICAL                                 | 배터리 CRITICAL 경고 처리      |
| 54 | checkStateAndMode()           | FS_C_17 | L2   | 504  | case BATTERY_WARNING_EMERGENCY                                | 배터리 EMERGENCY 경고 처리     |
| 55 | checkStateAndMode()           | FS_C_18 | L2   | 510  | default                                                       | 배터리 경고 기본 처리          |
| 56 | checkStateAndMode()           | FS_C_19 | L1   | 516  | if(armed_time != 0 && time < armed_time + spoolup_time)       | ESC 아밍 실패 체크 시간대      |
| 57 | checkStateAndMode()           | FS_C_20 | L1   | 522  | if(armed_time != 0 && time < armed_time + lockdown_time)      | 중요 고장 lockdown 시간대      |
| 58 | checkStateAndMode()           | FS_C_21 | L1   | 529  | if(!circuit_breaker_enabled)                                  | 회로차단기 비활성화 확인       |
| 59 | checkModeFallback()           | FS_M_01 | L1   | 549  | switch(param_com_posctl_navl)                                 | 위치제어 네비게이션 손실 응답  |
| 60 | checkModeFallback()           | FS_M_02 | L2   | 551  | case Altitude_Manual                                          | 고도/수동 모드 폴백 케이스     |
| 61 | checkModeFallback()           | FS_M_03 | L3   | 582  | if(POSCTL && !modeCanRun)                                     | POSCTL 모드 실행 불가 확인     |
| 62 | checkModeFallback()           | FS_M_04 | L3   | 589  | if(ALTCTL && !modeCanRun)                                     | ALTCTL 모드 실행 불가 확인     |
| 63 | checkModeFallback()           | FS_M_05 | L2   | 597  | case Land_Descend                                             | 착륙/하강 모드 폴백 케이스     |
| 64 | checkModeFallback()           | FS_M_06 | L3   | 600  | if(POSCTL && !modeCanRun)                                     | POSCTL 모드 실행 불가 확인     |
| 65 | checkModeFallback()           | FS_M_07 | L4   | 606  | if(!modeCanRun(AUTO_LAND))                                    | AUTO_LAND 모드 실행 불가 확인  |
| 66 | checkModeFallback()           | FS_M_08 | L1   | 617  | if(!modeCanRun(user_intended_mode))                           | 최종 모드 실행 가능성 확인     |
| 67 | modifyUserIntendedMode()      | FS_U_01 | L1   | 629  | if(previous_action > Warn)                                    | 이전 액션이 failsafe 액션인지  |
| 68 | modifyUserIntendedMode()      | FS_U_02 | L2   | 630  | if(current_mode == ORBIT)                                     | 현재 모드가 ORBIT인지 확인     |
| 69 | updateArmingState()           | FS_S_01 | L1   | 825  | if(armed)                                                     | 현재 아밍 상태 확인            |
| 70 | updateArmingState()           | FS_S_02 | L2   | 826  | if(!_was_armed)                                               | 이전 비아밍 상태 확인          |
| 71 | updateArmingState()           | FS_S_03 | L3   | 827  | if(manual_control_signal_lost)                                | 아밍 시 수동제어 손실 확인     |
| 72 | updateArmingState()           | FS_S_04 | L1   | 832  | if(!armed && _was_armed)                                      | 무장해제 상태 확인             |

:::

### 2.2 Failsafe 상태 조회 함수들 (HPP 인라인)

:::details 1. selectedAction()

- **위치**: framework.h:152
- **분기 레벨**: 0단계 (단순 반환)
- **분기 조건**: 없음 (inline 함수, 단순 멤버변수 반환)
- **커버리지 요구사항**: Commander Module에서 호출
  :::

:::details 2. inFailsafe()

- **위치**: framework.h:150
- **분기 레벨**: 0단계 (단순 반환)
- **분기 조건**: 없음 (inline 함수, 단순 비교 반환)
- **커버리지 요구사항**: Commander Module에서 호출
  :::

:::details 3. userTakeoverActive()

- **위치**: framework.h:156
- **분기 레벨**: 0단계
- **분기 조건**: 없음(_user_takeover_active 반환)
- **커버리지 요구사항**: Commander Module에서 호출
  :::

### 2.3 Failsafe 함수

:::details 1. fromNavDllOrRclActParam()

- **위치**: failsafe.cpp:43-82
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 8개 분기 만족

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

|   ID   | Level | 분기 조건                                      | 설명                   | 커버리지 요구사항 |
| :-----: | :---: | ---------------------------------------------- | ---------------------- | :---------------: |
| FS_N_02 |  L2  | gcs_connection_loss_failsafe_mode::Disabled    | GCS 연결 손실 비활성화 |  True(case) 필요  |
| FS_N_03 |  L2  | gcs_connection_loss_failsafe_mode::Hold_mode   | Hold 모드 설정         |  True(case) 필요  |
| FS_N_04 |  L2  | gcs_connection_loss_failsafe_mode::Return_mode | Return 모드 설정       |  True(case) 필요  |
| FS_N_05 |  L2  | gcs_connection_loss_failsafe_mode::Land_mode   | Land 모드 설정         |  True(case) 필요  |
| FS_N_06 |  L2  | gcs_connection_loss_failsafe_mode::Terminate   | Terminate 액션 설정    |  True(case) 필요  |
| FS_N_07 |  L2  | gcs_connection_loss_failsafe_mode::Disarm      | Disarm 액션 설정       |  True(case) 필요  |
| FS_N_08 |  L2  | default                                        | 기본값 처리            |  True(case) 필요  |

:::

:::details 2. fromGfActParam()

- **위치**: failsafe.cpp:84-124
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 8개 분기 만족

**분기 구조 분석:**

```
L1: switch (geofence_violation_action(param_value))
    case None:
    case Warning:
    case Hold_mode:
    case Return_mode:
    case Terminate:
    case Land_mode:
    default:
```

:::

:::details 3. fromImbalancedPropActParam()

- **위치**: failsafe.cpp:126-152
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 5개 분기 만족

**분기 구조 분석:**

```
L1: switch (imbalanced_propeller_failsafe_mode(param_value))
    case Disabled/default:
    case Warning:
    case Return:
    case Land:
```

:::

:::details 4. fromActuatorFailureActParam()

- **위치**: failsafe.cpp:154-185
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 6개 분기 만족

**분기 구조 분석:**

```
L1: switch (actuator_failure_failsafe_mode(param_value))
    case Warning_only/default:
    case Hold_mode:
    case Land_mode:
    case Return_mode:
    case Terminate:
```

:::

:::details 5. fromBatteryWarningActParam()

- **위치**: failsafe.cpp:187-246
- **분기 레벨**: 4단계 (중첩 switch문)
- **커버리지 요구사항**: 7개 분기 만족

**분기 구조 분석:**

```
L1: switch (battery_warning)
    case BATTERY_WARNING_NONE/default:
    case BATTERY_WARNING_LOW:
    case BATTERY_WARNING_CRITICAL:
        L3: switch (LowBatteryAction(param_value))
    case BATTERY_WARNING_EMERGENCY:
        L3: switch (LowBatteryAction(param_value))
```

:::

:::details 6. fromQuadchuteActParam()

- **위치**: failsafe.cpp:248-275
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 5개 분기 만족

**분기 구조 분석:**

```
L1: switch (command_after_quadchute(param_value))
    case Warning_only/default:
    case Return_mode:
    case Land_mode:
    case Hold_mode:
```

:::

:::details 7. fromOffboardLossActParam()

- **위치**: failsafe.cpp:277-324
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 8개 분기 만족

**분기 구조 분석:**

```
L1: switch (offboard_loss_failsafe_mode(param_value))
    case Position_mode/default:
    case Altitude_mode:
    case Manual:
    case Return_mode:
    case Land_mode:
    case Hold_mode:
    case Terminate:
    case Disarm:
```

:::

:::details 8. fromHighWindLimitActParam()

- **위치**: failsafe.cpp:326-366
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 7개 분기 만족

**분기 구조 분석:**

```
L1: switch (command_after_high_wind_failsafe(param_value))
    case None/default:
    case Warning:
    case Hold_mode:
    case Return_mode:
    case Terminate:
    case Land_mode:
```

:::

:::details 9. fromRemainingFlightTimeLowActParam()

- **위치**: failsafe.cpp:368-396
- **분기 레벨**: 2단계 (switch-case문)
- **커버리지 요구사항**: 4개 분기 만족

**분기 구조 분석:**

```
L1: switch (command_after_remaining_flight_time_low(param_value))
    case None/default:
    case Warning:
    case Return_mode:
```

:::

:::details 10. checkStateAndMode()

- **위치**: failsafe.cpp:398-546
- **분기 레벨**: 4단계 (중첩 if문 + switch문)
- **커버리지 요구사항**: 35개 분기 만족

**주요 분기 구조 분석:**

```
L1: RC 손실 검사
    if(!manual_control_signal_lost) - 신호 정상시 처리
    if(rc_in_mode != StickInputDisabled && !rc_loss_ignored) - RC 입력 체크
  
L1: GCS 연결 손실 검사  
    if(nav_dll_act != Disabled && !gcs_connection_loss_ignored) - GCS 연결 체크
  
L1: 배터리 경고 처리
    switch(battery_warning)
        case BATTERY_WARNING_LOW:
        case BATTERY_WARNING_CRITICAL:
        case BATTERY_WARNING_EMERGENCY:
        default:
      
L1: 시간 기반 조건부 처리
    if(armed_time != 0 && time < armed_time + spoolup_time) - 스풀업 시간 체크
    if(armed_time != 0 && time < armed_time + lockdown_time) - lockdown 시간 체크
```

|   ID   | Level | 분기 조건                                               | 설명                        |   커버리지 요구사항   |
| :-----: | :---: | ------------------------------------------------------- | --------------------------- | :-------------------: |
| FS_C_01 |  L1  | !manual_control_signal_lost                             | 수동 제어 신호 정상         | True/False 둘 다 필요 |
| FS_C_06 |  L1  | rc_in_mode != StickInputDisabled && !rc_loss_ignored    | RC 입력 활성화 및 무시 안됨 | True/False 둘 다 필요 |
| FS_C_08 |  L1  | nav_dll_act != Disabled && !gcs_connection_loss_ignored | GCS 연결손실 처리 활성화    | True/False 둘 다 필요 |
| FS_C_14 |  L1  | switch(battery_warning)                                 | 배터리 경고 레벨 분기       |    모든 case 필요    |
| FS_C_20 |  L1  | armed_time != 0 && time < armed_time + lockdown_time    | 중요 고장 lockdown 시간대   | True/False 둘 다 필요 |

:::

:::details 11. checkModeFallback()

- **위치**: failsafe.cpp:548-623
- **분기 레벨**: 4단계 (switch + 중첩 if문)
- **커버리지 요구사항**: 8개 분기 만족

**분기 구조 분석:**

```
L1: switch(_param_com_posctl_navl.get())
    case Altitude_Manual:
        L3: if(POSCTL && !modeCanRun) - POSCTL 폴백 체크
        L3: if(ALTCTL && !modeCanRun) - ALTCTL 폴백 체크
    case Land_Descend:
        L3: if(POSCTL && !modeCanRun) - POSCTL 폴백 체크
        L4: if(!modeCanRun(AUTO_LAND)) - AUTO_LAND 폴백 체크

L1: if(!modeCanRun(user_intended_mode)) - 최종 모드 체크
```

:::

:::details 12. updateArmingState()

- **위치**: failsafe.cpp:548-560
- **분기 레벨**: 3단계 (중첩 if문)
- **커버리지 요구사항**: 4개 분기 만족

**분기 구조 분석:**

```
L1: if(armed) - 현재 아밍 상태
    L2: if(!_was_armed) - 이전 비아밍 상태
        L3: if(manual_control_signal_lost) - 아밍 시 수동제어 손실
L1: if(!armed && _was_armed) - 무장해제 상태
```

:::

:::details 13. modifyUserIntendedMode()

- **위치**: failsafe.cpp:625-636
- **분기 레벨**: 2단계 (중첩 if문)
- **커버리지 요구사항**: 2개 분기 만족

**분기 구조 분석:**

```
L1: if(previous_action > Action::Warn) - 이전 액션이 failsafe 액션인지
    L2: if(current_mode == ORBIT) - 현재 모드가 ORBIT인지 확인
```

:::

### 2.4 FailsafeBase 함수

:::details 1. FailsafeBase::update()

- **위치**: framework.cpp:53-108
- **분기 레벨**: 3단계 (중첩 if문)
- **커버리지 요구사항**: 6개 분기 만족

**분기 구조 분석:**

```
L1: if(_last_update == 0) - 첫 번째 업데이트
L1: if(arming_state_changed) - 아밍 상태 변화
L1: if(user_intended_mode_updated || _user_takeover_active) - 모드 업데이트
L1: if(defer_timeout_check) - Failsafe 지연 타임아웃
L1: if(_failsafe_defer_started == 0) - Failsafe 지연 시작 안됨
L1: if(notification_required) - 사용자 알림 필요
```

:::

:::details 2. updateFailsafeDeferState()

- **위치**: framework.cpp:109-120
- **분기 레벨**: 1단계 (if문)
- **커버리지 요구사항**: 2개 분기 만족

**분기 구조 분석:**

```
L1: if(defer && _failsafe_defer_started == 0) - 지연 시작 조건
```

:::

:::details 3. updateStartDelay()

- **위치**: framework.cpp:121-142
- **분기 레벨**: 2단계 (중첩 if문)
- **커버리지 요구사항**: 3개 분기 만족
- 해당 분기:

**분기 구조 분석:**

```
L1: if(delay_active) - 지연 활성화 상태
    L2: if(_current_delay > dt) - 지연 시간 남음
L1: else - 지연 비활성화
```

:::

:::details 4. updateDelay()

- **위치**: framework.cpp:149-158
- **분기 레벨**: 1단계 (if문)
- **커버리지 요구사항**: 2개 분기 만족

**분기 구조 분석:**

```
L1: if(_current_delay > 0) - 지연 중인 상태
```

:::

:::details 5. removeActions()

- **위치**: framework.cpp:159-170
- **분기 레벨**: 2단계 (중첩 for + if문)
- **커버리지 요구사항**: 2개 분기 만족

**분기 구조 분석:**

```
for(action in _actions)
    L1: if(action.clear_condition == condition) - 조건 일치하는 액션
```

:::

:::details 6. notifyUser()

- **위치**: framework.cpp:171-284
- **분기 레벨**: 4단계 (복잡한 중첩 구조)
- **커버리지 요구사항**: 15개 분기 만족

**주요 분기 구조 분석:**

```
L1: switch(action) - 액션 타입별 메시지
    case Hold/RTL/Land/Descend/Disarm/Terminate:
L1: switch(cause) - 원인별 상세 메시지
    case ManualControlLoss/GCSConnectionLoss/BatteryLow/etc:
L1: if(delayed_action != Action::None) - 지연된 액션 존재
L1: mavlink_log 메시지 전송 분기들
```

:::

:::details 7. checkFailsafe()

- **위치**: framework.cpp:285-380
- **분기 레벨**: 4단계 (복잡한 조건문)
- **커버리지 요구사항**: 12개 분기 만족

**주요 분기 구조 분석:**

```
L1: if(!options.valid()) - 유효하지 않은 옵션
L1: if(caller_id < 0 || caller_id >= max_num_actions) - ID 범위 검사
L1: if(last_state_failure != cur_state_failure) - 상태 변화 검사
L1: if(cur_state_failure) - 현재 실패 상태
    L2: if(!last_state_failure) - 새로운 실패
        L3: if(options.can_be_deferred && _defer_failsafes) - 지연 가능
L1: if(!cur_state_failure && last_state_failure) - 실패 해제
```

:::

:::details 8. removeAction()

- **위치**: framework.cpp:381-397
- **분기 레벨**: 2단계 (switch + if문)
- **커버리지 요구사항**: 5개 분기 만족

**분기 구조 분석:**

```
L1: switch(action.clear_condition) - 클리어 조건별 처리
    case WhenConditionClears:
    case OnModeChangeOrDisarm:
    case OnDisarm:
    case Never:
```

:::

:::details 9. removeNonActivatedActions()

- **위치**: framework.cpp:399-409
- **분기 레벨**: 2단계 (for + if문)
- **커버리지 요구사항**: 2개 분기 만족

**분기 구조 분석:**

```
for(action in _actions)
    L1: if(!action.activated && action.valid()) - 비활성화된 유효 액션
```

:::

:::details 10. getSelectedAction()

- **위치**: framework.cpp:411-508
- **분기 레벨**: 4단계 (복잡한 선택 로직)
- **커버리지 요구사항**: 20개 분기 만족

**주요 분기 구조 분석:**

```
L1: for(action in _actions) - 모든 액션 검사
    L2: if(action.valid()) - 유효한 액션
        L3: if(action > selected_action) - 우선순위 높은 액션
L1: if(selected_action != Action::None) - 액션 선택됨
    L2: if(allow_user_takeover conditions) - 사용자 접수 허용 조건들
    L2: if(rc_sticks_takeover_request) - RC 스틱 접수 요청
L1: mode fallback 처리 분기들
```

:::

:::details 11. clearDelayIfNeeded()

- **위치**: framework.cpp:510-525
- **분기 레벨**: 2단계 (중첩 if문)
- **커버리지 요구사항**: 4개 분기 만족

**분기 구조 분석:**

```
L1: if(_current_delay > 0) - 지연 중
    L2: if(state.user_intended_mode changed) - 모드 변경
    L2: if(no active actions) - 활성 액션 없음
```

:::

:::details 12. actionAllowsUserTakeover()

- **위치**: framework.cpp:527-541
- **분기 레벨**: 1단계 (switch문)
- **커버리지 요구사항**: 8개 분기 만족

**분기 구조 분석:**

```
L1: switch(action) - 액션별 사용자 접수 허용 여부
    case None/Warn: return true
    case Hold/RTL/Land/Descend: return true  
    case Disarm/Terminate: return false
```

:::

:::details 13. modeFromAction()

- **위치**: framework.cpp:543-578
- **분기 레벨**: 2단계 (switch문)
- **커버리지 요구사항**: 10개 분기 만족

**분기 구조 분석:**

```
L1: switch(action) - 액션을 모드로 변환
    case None/Warn: return user_intended_mode
    case FallbackPosCtrl: return POSCTL
    case FallbackAltCtrl: return ALTCTL
    case FallbackStab: return STAB
    case Hold: return AUTO_LOITER
    case RTL: return AUTO_RTL
    case Land: return AUTO_LAND
    case Descend: return DESCEND
    case Disarm/Terminate: return user_intended_mode
```

:::

:::details 14. modeCanRun()

- **위置**: framework.cpp:580-605
- **분기 레벨**: 3단계 (복잡한 비트 연산)
- **커버리지 요구사항**: 8개 분기 만족

**분기 구조 분석:**

```
L1: if(mode >= NAVIGATION_STATE_MAX) - 모드 범위 검사
L1: mode 그룹별 can_run 비트마스크 검사
    L2: 각 모드 그룹에 대한 비트 연산
    L2: 특수 모드들에 대한 개별 처리
```

:::

:::details 15. deferFailsafes()

- **위치**: framework.cpp:607-623
- **분기 레벨**: 2단계 (중첩 if문)
- **커버리지 요구사항**: 4개 분기 만족

**분기 구조 분석:**

```
L1: if(enabled) - 지연 활성화
    L2: if(inFailsafe()) - 이미 failsafe 중
L1: else - 지연 비활성화
```

:::

## 3. 시험 환경 및 데이터 출처

### 3.1 하드웨어/소프트웨어 구성도

- **체계통합 시험 환경**: FMS HILS 환경 상에서 타겟 보드(전체 펌웨어 업로드) 운용.
- **SITL (Software In The Loop)**: Gazebo 시뮬레이션 환경
- **HITL (Hardware In The Loop)**: 실제 하드웨어와 시뮬레이션 조합

### 3.2 입력 데이터 출처

::: details Commander Module

- **vehicle_status**: Commander 모듈 - 상태 정보
- **failsafe_flags_s**: Commander 모듈 - failsafe 조건 플래그들
  :::

::: details uORB MSG

- **vehicle_command**: uORB - 비행체 명령
- **battery_status**: uORB - 배터리 상태 정보
- **mission_result**: uORB - 미션 실행 결과
- **geofence_result**: uORB - 지오펜스 위반 상태
  :::

::: details Parameter

- **NAV_DLL_ACT**: GCS 연결 손실 액션
- **NAV_RCL_ACT**: RC 연결 손실 액션
- **COM_RCL_EXCEPT**: RC 손실 예외 조건
- **COM_RC_IN_MODE**: RC 입력 모드 설정
- **GF_ACTION**: 지오펜스 위반 액션
- **COM_LOW_BAT_ACT**: 배터리 저전압 액션
- **COM_IMB_PROP_ACT**: 불균형 프로펠러 액션
- **COM_ACT_FAIL_ACT**: 액추에이터 고장 액션
  :::

### 3.3 외부 조작 방법

- **MAVLink 명령**: GCS SW에서 명령 인가
- **Parameter 변경**: GCS SW에서 변경
- **RC 신호 조작**: RC 송신기 ON/OFF

### 3.4 출력 데이터

- **failsafe_flags**: uORB failsafe 상태 플래그
- **vehicle_command_ack**: uORB 비행체 명령 확인
- **로그 데이터**: failsafe 상태 및 액션 이력 확인
- **GCS SW**: GCS SW에서 출력되는 failsafe 메시지 확인

### 3.5 권장사항

1. **Dynamic Testing**: COVER 분기들에 대해 운용 시나리오 기반 테스트 우선 수행
2. **Static Analysis**: STATIC 분기들에 대해 탐침코드를 통한 직접 검증 필요
3. **Coverage Tools**: gcov/lcov를 활용한 실제 코드 커버리지 측정 병행

## 4. 시나리오(Test Case) 수립 및 분기 커버 분류

### 4.1 COVER (시뮬레이션 가능) 시나리오

:::details TC-01 : RC 신호 손실 failsafe

- **목적**: RC 신호 손실 시 설정된 failsafe 액션 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - (commander) failsafe_flags_s.manual_control_signal_lost
  - (param) NAV_RCL_ACT, COM_RCL_EXCEPT
- **입력 값 실제자료 여부**
  - (commander) failsafe_flags_s : 실제 자료
  - (param) NAV_RCL_ACT, COM_RCL_EXCEPT : 실제 자료
- **시험입력 사용방법**
  - (commander) Commander 모듈에서 failsafe_flags 데이터 수신
  - (param) GCS SW에서 매개변수 값 입력
- **시험 입력 순서**
  - GCS SW에서 NAV_RCL_ACT '3' (Return 모드) 값 입력
  - RC 송신기 OFF로 manual_control_signal_lost = true 상태 생성

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 NAV_RCL_ACT '3' (Return 모드) 값 입력
3. 드론 아밍 및 이륙
4. RC 송신기 정상 상태에서 failsafe 상태 False 확인
5. RC 송신기 OFF로 manual_control_signal_lost = true 생성
6. GCS SW에서 RTL 모드 전환 및 failsafe 활성화 확인
7. RC 송신기 ON으로 신호 복구
8. 사용자 모드 전환 가능성 확인 (User takeover)
9. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 로그 자료에서 selectedAction() = RTL 확인
  - 로그 자료에서 inFailsafe() = true 확인
- **시험결과 승인 범위**
  - failsafe 활성화: inFailsafe() = true
  - 액션 실행: selectedAction() = RTL
- **시험결과 입출력 조건**
  1. manual_control_signal_lost = false → inFailsafe() = false
  2. manual_control_signal_lost = true → inFailsafe() = true, selectedAction() = RTL

:::

:::details TC-02 : 배터리 경고 단계별 failsafe

- **목적**: 배터리 경고 레벨별 차등화된 failsafe 액션 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - (uORB) battery_status.warning
  - (param) COM_LOW_BAT_ACT
- **시험 입력 순서**
  - GCS SW에서 COM_LOW_BAT_ACT '3' (ReturnOrLand) 값 입력
  - SITL에서 배터리 레벨 단계적 감소 시뮬레이션

::: info **상세 시험절차**

1. GCS SW에서 COM_LOW_BAT_ACT '3' (ReturnOrLand) 설정
2. 드론 아밍 및 이륙
3. SITL에서 battery_warning = LOW 설정 → Warn 액션 확인
4. SITL에서 battery_warning = CRITICAL 설정 → RTL 액션 확인
5. SITL에서 battery_warning = EMERGENCY 설정 → Land 액션 확인
6. 각 단계별 failsafe 동작 및 액션 전환 확인

:::

:::details TC-03 : 지오펜스 위반 failsafe

- **목적**: 지오펜스 경계 위반 시 설정된 액션 실행 확인

::: info **시험 입력자료**

- **입력 자료**
  - (uORB) geofence_result.geofence_breached
  - (param) GF_ACTION
- **입력 값 실제자료 여부**
  - (uORB) geofence_result : 실제 자료
  - (param) GF_ACTION : 실제 자료
- **시험입력 사용방법**
  - (uORB) Geofence 모듈에서 지오펜스 위반 상태 수신
  - (param) GCS SW에서 매개변수 값 입력
- **시험 입력 순서**
  - GCS SW에서 지오펜스 설정 및 GF_ACTION '3' (Return) 값 입력
  - 드론을 지오펜스 경계 밖으로 비행

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 지오펜스 영역 설정 (반경 100m 원형 지오펜스)
3. GCS SW에서 GF_ACTION '3' (Return 모드) 값 입력
4. 드론 아밍 및 이륙
5. 지오펜스 내부에서 failsafe 상태 False 확인
6. 드론을 지오펜스 경계 밖으로 비행하여 geofence_breached = true 생성
7. GCS SW에서 RTL 모드 전환 및 failsafe 활성화 확인
8. 드론이 지오펜스 내부로 복귀 시 failsafe 해제 확인
9. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 로그 자료에서 selectedAction() = RTL 확인
  - 로그 자료에서 inFailsafe() = true 확인
- **시험결과 승인 범위**
  - failsafe 활성화: inFailsafe() = true
  - 액션 실행: selectedAction() = RTL
- **시험결과 입출력 조건**
  1. geofence_breached = false → inFailsafe() = false
  2. geofence_breached = true → inFailsafe() = true, selectedAction() = RTL

:::

:::details TC-04 : GCS 연결 손실 failsafe

- **목적**: GCS 연결 손실 시 설정된 failsafe 액션 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - (commander) failsafe_flags_s.gcs_connection_lost
  - (param) NAV_DLL_ACT
- **입력 값 실제자료 여부**
  - (commander) failsafe_flags_s : 실제 자료
  - (param) NAV_DLL_ACT : 실제 자료
- **시험입력 사용방법**
  - (commander) Commander 모듈에서 failsafe_flags 데이터 수신
  - (param) GCS SW에서 매개변수 값 입력
- **시험 입력 순서**
  - GCS SW에서 NAV_DLL_ACT '2' (Hold 모드) 값 입력
  - GCS 통신 연결 중단으로 gcs_connection_lost = true 상태 생성

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 NAV_DLL_ACT '2' (Hold 모드) 값 입력
3. 드론 아밍 및 이륙
4. GCS 연결 정상 상태에서 failsafe 상태 False 확인
5. GCS 통신 케이블 분리 또는 네트워크 차단으로 gcs_connection_lost = true 생성
6. 드론에서 AUTO_LOITER 모드 전환 및 failsafe 활성화 확인
7. GCS 연결 복구 시 failsafe 해제 확인
8. 사용자 모드 전환 가능성 확인
9. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 로그 자료에서 selectedAction() = Hold 확인
  - 로그 자료에서 inFailsafe() = true 확인
- **시험결과 승인 범위**
  - failsafe 활성화: inFailsafe() = true
  - 액션 실행: selectedAction() = Hold
- **시험결과 입출력 조건**
  1. gcs_connection_lost = false → inFailsafe() = false
  2. gcs_connection_lost = true → inFailsafe() = true, selectedAction() = Hold

:::

:::details TC-05 : 미션 실패 failsafe

- **목적**: 자동 미션 실행 실패 시 설정된 failsafe 액션 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - (uORB) mission_result.failure
  - (commander) failsafe_flags_s.mission_failure
  - (param) COM_QC_ACT (Quad-chute 액션)
- **입력 값 실제자료 여부**
  - (uORB) mission_result : 실제 자료
  - (commander) failsafe_flags_s : 실제 자료
  - (param) COM_QC_ACT : 실제 자료
- **시험입력 사용방법**
  - (uORB) Mission 모듈에서 미션 실패 상태 수신
  - (param) GCS SW에서 매개변수 값 입력
- **시험 입력 순서**
  - GCS SW에서 COM_QC_ACT '1' (Return 모드) 값 입력
  - AUTO_MISSION 모드에서 미션 실행 중 강제 실패 상황 생성

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 미션 계획 설정 (웨이포인트 5개)
3. GCS SW에서 COM_QC_ACT '1' (Return 모드) 값 입력
4. 드론 아밍 및 AUTO_MISSION 모드 전환
5. 미션 실행 중 waypoint 도달 불가 상황 발생 (장애물 등)
6. mission_result.failure = true 및 mission_failure 플래그 확인
7. 드론에서 RTL 모드 전환 및 failsafe 활성화 확인
8. 미션 재설정 후 failsafe 해제 확인
9. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 로그 자료에서 selectedAction() = RTL 확인
  - 로그 자료에서 inFailsafe() = true 확인
- **시험결과 승인 범위**
  - failsafe 활성화: inFailsafe() = true
  - 액션 실행: selectedAction() = RTL
- **시험결과 입출력 조건**
  1. mission_failure = false → inFailsafe() = false
  2. mission_failure = true → inFailsafe() = true, selectedAction() = RTL

:::

:::details TC-06 : 중요 시스템 고장 failsafe

- **목적**: 중요 센서 고장 시 설정된 failsafe 액션 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - (commander) failsafe_flags_s.fd_critical_failure
  - (param) COM_ACT_FAIL_ACT
- **입력 값 실제자료 여부**
  - (commander) failsafe_flags_s : 실제 자료
  - (param) COM_ACT_FAIL_ACT : 실제 자료
- **시험입력 사용방법**
  - (commander) HealthAndArmingChecks에서 중요 고장 상태 수신
  - (param) GCS SW에서 매개변수 값 입력
- **시험 입력 순서**
  - GCS SW에서 COM_ACT_FAIL_ACT '3' (Land 모드) 값 입력
  - 중요 센서 (IMU, 바로미터 등) 고장 시뮬레이션

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 COM_ACT_FAIL_ACT '3' (Land 모드) 값 입력
3. 드론 아밍 및 이륙
4. SITL에서 IMU 센서 고장 시뮬레이션 (센서 값 이상)
5. fd_critical_failure 플래그 활성화 확인
6. 드론에서 AUTO_LAND 모드 전환 및 failsafe 활성화 확인
7. 긴급 착륙 실행 및 자동 disarm 확인
8. 센서 복구 후 시스템 정상화 확인
9. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 로그 자료에서 selectedAction() = Land 확인
  - 로그 자료에서 inFailsafe() = true 확인
- **시험결과 승인 범위**
  - failsafe 활성화: inFailsafe() = true
  - 액션 실행: selectedAction() = Land
- **시험결과 입출력 조건**
  1. fd_critical_failure = false → inFailsafe() = false
  2. fd_critical_failure = true → inFailsafe() = true, selectedAction() = Land

:::

:::details TC-07 : 바람/비행시간 제한 초과 failsafe

- **목적**: 바람 한계 초과 또는 비행시간 제한 초과 시 설정된 failsafe 액션 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - (commander) failsafe_flags_s.wind_limit_exceeded
  - (commander) failsafe_flags_s.flight_time_limit_exceeded
  - (param) COM_WIND_MAX, COM_FLT_TIME_MAX
- **입력 값 실제자료 여부**
  - (commander) failsafe_flags_s : 실제 자료
  - (param) COM_WIND_MAX, COM_FLT_TIME_MAX : 실제 자료
- **시험입력 사용방법**
  - (commander) Commander 모듈에서 환경 조건 모니터링
  - (param) GCS SW에서 매개변수 값 입력
- **시험 입력 순서**
  - GCS SW에서 바람 한계값 및 비행시간 한계값 설정
  - SITL에서 강풍 상황 또는 장시간 비행 시뮬레이션

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 COM_WIND_MAX '10' (10m/s), COM_FLT_TIME_MAX '600' (10분) 설정
3. 드론 아밍 및 이륙
4. SITL에서 바람 속도를 15m/s로 설정하여 wind_limit_exceeded = true 생성
5. 바람 제한 초과 failsafe 활성화 및 RTL 액션 확인
6. 바람 조건 정상화 후 failsafe 해제 확인
7. 장시간 비행으로 flight_time_limit_exceeded = true 생성
8. 비행시간 제한 초과 failsafe 활성화 및 Land 액션 확인
9. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 바람 제한: selectedAction() = RTL 확인
  - 비행시간 제한: selectedAction() = Land 확인
  - 로그 자료에서 inFailsafe() = true 확인
- **시험결과 승인 범위**
  - failsafe 활성화: inFailsafe() = true
  - 적절한 액션 실행
- **시험결과 입출력 조건**
  1. wind_limit_exceeded = true → selectedAction() = RTL
  2. flight_time_limit_exceeded = true → selectedAction() = Land

:::

:::details TC-08 : 모드 폴백 failsafe

- **목적**: 현재 비행 모드 실행 불가 시 안전한 모드로 폴백 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - (commander) HealthAndArmingChecks 모드 실행 가능성
  - (param) COM_POSCTL_NAVL
  - user_intended_mode 변경 요청
- **입력 값 실제자료 여부**
  - (commander) HealthAndArmingChecks : 실제 자료
  - (param) COM_POSCTL_NAVL : 실제 자료
- **시험입력 사용방법**
  - (commander) 모드별 실행 조건 모니터링
  - (param) GCS SW에서 폴백 정책 설정
- **시험 입력 순서**
  - GCS SW에서 COM_POSCTL_NAVL '0' (Altitude_Manual) 설정
  - GPS 신호 차단으로 Position Control 모드 실행 불가 상황 생성

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 COM_POSCTL_NAVL '0' (Altitude_Manual) 설정
3. 드론 아밍 및 Position Control 모드 진입
4. GPS 신호 차단으로 position control 불가 상황 생성
5. checkModeFallback() 함수에 의한 모드 폴백 확인
6. ALTCTL 모드로 폴백 및 동작 확인
7. ALTCTL도 불가 시 Manual 모드로 최종 폴백 확인
8. GPS 신호 복구 시 원래 모드 복귀 가능성 확인
9. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 로그 자료에서 모드 폴백 순서 확인 (POSCTL → ALTCTL → MANUAL)
  - 각 모드별 실행 가능성 체크 결과
- **시험결과 승인 범위**
  - 적절한 폴백 모드 선택
  - 안전한 모드 전환
- **시험결과 입출력 조건**
  1. POSCTL 불가 → ALTCTL 모드 폴백
  2. ALTCTL 불가 → MANUAL 모드 폴백

:::

:::details TC-09 : 사용자 수동 접수 (User Takeover) 시나리오

- **목적**: Failsafe 활성 중 사용자의 수동 조작으로 failsafe 해제 동작 확인

::: info **시험 입력자료**

- **입력 자료**
  - RC 스틱 입력 (수동 조작)
  - 현재 활성화된 failsafe 액션
  - (param) User takeover 허용 정책
- **입력 값 실제자료 여부**
  - RC 스틱 입력 : 실제 자료
  - failsafe 액션 : 실제 자료
- **시험입력 사용방법**
  - RC 송신기를 통한 수동 조작
  - GCS SW에서 takeover 정책 확인
- **시험 입력 순서**
  - RC 손실로 RTL failsafe 활성화
  - RC 신호 복구 후 수동 스틱 조작으로 takeover 시도

::: info **상세 시험절차**

1. GCS SW에서 FCS의 로그 기록 시작
2. GCS SW에서 NAV_RCL_ACT '3' (Return 모드) 설정
3. 드론 아밍 및 이륙 후 RC 송신기 OFF
4. RTL failsafe 활성화 및 자동 귀환 시작 확인
5. RC 송신기 ON으로 신호 복구
6. RC 스틱을 중립 위치에서 벗어나게 조작하여 takeover 시도
7. userTakeoverActive() = true 및 failsafe 해제 확인
8. Manual 모드로 전환 및 수동 조작 가능 확인
9. 다시 스틱 중립 시 원래 모드 복귀 가능성 확인
10. GCS SW에서 FCS의 로그 기록 종료

::: info **시험 예상결과**

- **시험결과 출력 자료**
  - 로그 자료에서 userTakeoverActive() = true 확인
  - 로그 자료에서 inFailsafe() = false 전환 확인
- **시험결과 승인 범위**
  - User takeover 활성화
  - Failsafe 해제 및 수동 조작 복귀
- **시험결과 입출력 조건**
  1. RC 스틱 중립 + Failsafe 활성 → inFailsafe() = true
  2. RC 스틱 조작 + 신호 정상 → userTakeoverActive() = true, inFailsafe() = false

:::

### 4.2 STATIC (탐침코드 필요) 분기

::: details ST-01 : 배터리 경고 파라미터 Edge Case

- **해당 분기**: FS_B_06, FS_B_07
- **위치**: fromBatteryWarningActParam():215-217
- **조건**: param_value == ReturnOrLand && battery_warning == CRITICAL
- **검증 불가 이유**: 정확한 파라미터 값과 경고 레벨 조합의 동시 발생 어려움
- **탐침코드 필요**: 배터리 경고 레벨 및 파라미터 강제 설정
  :::

::: details ST-02 : 모드 폴백 복합 조건

- **해당 분기**: FS_M_07
- **위치**: checkModeFallback():606-609
- **조건**: POSCTL 불가 && AUTO_LAND 불가 상황
- **검증 불가 이유**: 다중 모드 동시 불가 상황 시뮬레이션 제한
- **탐침코드 필요**: modeCanRun() 함수 반환값 강제 설정
  :::

::: details ST-03 : 아밍 시간 기반 조건

- **해당 분기**: FS_C_13, FS_C_19, FS_C_20
- **위치**: checkStateAndMode():482-534
- **조건**: 정밀한 아밍 시간과 스풀업/lockdown 시간 비교
- **검증 불가 이유**: 시뮬레이션에서 정밀한 시간 제어 어려움
- **탐침코드 필요**: _armed_time 및 현재 시간 직접 조작
  :::

### 4.3 분기 커버리지 요약

| 함수명                        | 분기 ID 범위        | 총 분기      | COVER        | STATIC      | 커버리지(%)   |
| ----------------------------- | ------------------- | ------------ | ------------ | ----------- | ------------- |
| selectedAction()              | -                   | 1            | 1            | 0           | 100%          |
| inFailsafe()                  | -                   | 1            | 1            | 0           | 100%          |
| userTakeoverActive()          | -                   | 1            | 1            | 0           | 100%          |
| fromNavDllOrRclActParam()     | FS_N_01~08          | 8            | 8            | 0           | 100%          |
| fromGfActParam()              | FS_G_01~08          | 8            | 8            | 0           | 100%          |
| fromImbalancedPropActParam()  | FS_I_01~05          | 5            | 5            | 0           | 100%          |
| fromActuatorFailureActParam() | FS_A_01~06          | 6            | 6            | 0           | 100%          |
| fromBatteryWarningActParam()  | FS_B_01~07          | 7            | 5            | 2           | 71%           |
| checkStateAndMode()           | FS_C_01~21          | 21           | 18           | 3           | 86%           |
| checkModeFallback()           | FS_M_01~08          | 8            | 7            | 1           | 88%           |
| modifyUserIntendedMode()      | FS_U_01~02          | 2            | 2            | 0           | 100%          |
| updateArmingState()           | FS_S_01~04          | 4            | 4            | 0           | 100%          |
| **전체**                | **72개 분기** | **72** | **66** | **6** | **92%** |
