# FailureDetector 동적 시험 케이스

## 개요
- **목적**: FailureDetector 모듈의 100% 코드 커버리지 달성
- **범위**: 모든 분기문, 조건문, 함수, 클래스 커버
- **시험 방법**: 단위 시험 및 통합 시험

## 1. 분기문 분석 및 분류

### 1.1 FailureInjector 클래스 분기문

#### A. FailureInjector::update() - 실패 주입 명령 처리
**분기 구조 분석:**
```
L1: while (_vehicle_command_sub.update(&vehicle_command))
    L2: if (vehicle_command.command != VEHICLE_CMD_INJECT_FAILURE)
    L2: if (failure_unit == FAILURE_UNIT_SYSTEM_MOTOR)
        L3: if (failure_type == FAILURE_TYPE_OK)
            L4: if (instance == 0)
            L4: else if (instance >= 1 && instance <= CONNECTED_ESC_MAX)
        L3: else if (failure_type == FAILURE_TYPE_OFF)
            L4: if (instance == 0)
            L4: else if (instance >= 1 && instance <= CONNECTED_ESC_MAX)
        L3: else if (failure_type == FAILURE_TYPE_WRONG)
            L4: if (instance == 0)
            L4: else if (instance >= 1 && instance <= CONNECTED_ESC_MAX)
    L2: if (handled)
```

| ID | Level | 분기 조건 | 설명 | 커버리지 요구사항 |
|----|-------|----------|------|------------------|
| FI-01 | L1 | `_vehicle_command_sub.update(&vehicle_command)` | 명령 구독 업데이트 | True/False 모두 필요 |
| FI-02 | L2 | `vehicle_command.command != VEHICLE_CMD_INJECT_FAILURE` | 실패 주입 명령 확인 | True(continue)/False 모두 필요 |
| FI-03 | L2 | `failure_unit == FAILURE_UNIT_SYSTEM_MOTOR` | 모터 시스템 단위 확인 | True/False 모두 필요 |
| FI-04 | L3 | `failure_type == FAILURE_TYPE_OK` | 정상 복구 타입 | True/False 모두 필요 |
| FI-05 | L4 | `instance == 0` (OK 타입 내) | 모든 모터 정상화 | True/False 독립 필요 |
| FI-06 | L4 | `instance >= 1 && instance <= CONNECTED_ESC_MAX` (OK 타입 내) | 특정 모터 정상화 | True/False 독립 필요 |
| FI-07 | L3 | `failure_type == FAILURE_TYPE_OFF` | 모터 차단 타입 | True/False 모두 필요 |
| FI-08 | L4 | `instance == 0` (OFF 타입 내) | 모든 모터 차단 | True/False 독립 필요 |
| FI-09 | L4 | `instance >= 1 && instance <= CONNECTED_ESC_MAX` (OFF 타입 내) | 특정 모터 차단 | True/False 독립 필요 |
| FI-10 | L3 | `failure_type == FAILURE_TYPE_WRONG` | 모터 오작동 타입 | True/False 모두 필요 |
| FI-11 | L4 | `instance == 0` (WRONG 타입 내) | 모든 모터 오작동 | True/False 독립 필요 |
| FI-12 | L4 | `instance >= 1 && instance <= CONNECTED_ESC_MAX` (WRONG 타입 내) | 특정 모터 오작동 | True/False 독립 필요 |
| FI-13 | L2 | `handled` | 명령 처리 완료 확인 | True/False 모두 필요 |

#### B. FailureInjector::manipulateEscStatus() - ESC 상태 조작
**분기 구조 분석:**
```
L1: if (_esc_blocked != 0 || _esc_wrong != 0)
    L2: for (int i = 0; i < status.esc_count; i++)
        L3: if (_esc_blocked & (1 << i_esc))
        L3: else if (_esc_wrong & (1 << i_esc))
```

| ID | Level | 분기 조건 | 설명 | 커버리지 요구사항 |
|----|-------|----------|------|------------------|
| FI-14 | L1 | `_esc_blocked != 0 \|\| _esc_wrong != 0` | ESC 조작 필요성 확인 | True/False 모두 필요 |
| FI-15 | L3 | `_esc_blocked & (1 << i_esc)` | 특정 ESC 차단 확인 | True/False 독립 필요 |
| FI-16 | L3 | `_esc_wrong & (1 << i_esc)` | 특정 ESC 오작동 확인 | True/False 독립 필요 |

### 1.2 FailureDetector 클래스 분기문

#### A. FailureDetector::update() - 메인 업데이트
| ID | 분기 조건 | 설명 |
|----|----------|------|
| FD-01 | `vehicle_control_mode.flag_control_attitude_enabled` | 자세 제어 활성화 확인 |
| FD-02 | `_esc_status_sub.update(&esc_status)` | ESC 상태 업데이트 |
| FD-03 | `_param_escs_en.get()` | ESC 감지 활성화 파라미터 |
| FD-04 | `_param_fd_actuator_en.get()` | 액추에이터 감지 활성화 파라미터 |
| FD-05 | `_param_fd_imb_prop_thr.get() > 0` | 불균형 프로펠러 감지 임계값 |

#### B. FailureDetector::updateAttitudeStatus() - 자세 실패 감지
**분기 구조 분석:**
```
L1: if (_vehicle_attitude_sub.update(&attitude))
    L2: if (vehicle_status.is_vtol_tailsitter)
        L3: if (vehicle_status.in_transition_mode)
        L3: else if (vehicle_status.vehicle_type == VEHICLE_TYPE_FIXED_WING)
```

| ID | Level | 분기 조건 | 설명 | 커버리지 요구사항 |
|----|-------|----------|------|------------------|
| FD-06 | L1 | `_vehicle_attitude_sub.update(&attitude)` | 자세 데이터 업데이트 | True/False 모두 필요 |
| FD-07 | L2 | `vehicle_status.is_vtol_tailsitter` | 테일시터 VTOL 확인 | True/False 모두 필요 (L1=True 조건 하에) |
| FD-08 | L3 | `vehicle_status.in_transition_mode` | 전환 모드 확인 | True/False 독립 필요 (L2=True 조건 하에) |
| FD-09 | L3 | `vehicle_status.vehicle_type == VEHICLE_TYPE_FIXED_WING` | 고정익 타입 확인 | True/False 독립 필요 (L2=True, L3=False 조건 하에) |

#### C. FailureDetector::updateEscsStatus() - ESC 상태 감지
**분기 구조 분석:**
```
L1: if (vehicle_status.arming_state == ARMING_STATE_ARMED)
    L2: for (int i = 0; i < limited_esc_count; i++)
        L3: is_esc_failure = is_esc_failure || (esc_status.esc[i].failures > 0)
    L2: if (_esc_failure_hysteresis.get_state())
L1: else (Disarmed)
```

| ID | Level | 분기 조건 | 설명 | 커버리지 요구사항 |
|----|-------|----------|------|------------------|
| FD-10 | L1 | `vehicle_status.arming_state == ARMING_STATE_ARMED` | 무장 상태 확인 | True/False 모두 필요 |
| FD-11 | L2 | `_esc_failure_hysteresis.get_state()` | ESC 실패 히스테리시스 상태 | True/False 독립 필요 (L1=True 조건 하에) |

#### D. FailureDetector::updateImbalancedPropStatus() - 불균형 프로펠러 감지
**분기 구조 분석:**
```
L1: if (_sensor_selection_sub.updated())
    L2: if (_sensor_selection_sub.copy(&selection))
L1: if (imu_status.accel_device_id != _selected_accel_device_id)
    L2: for (unsigned i = 0; i < ORB_MULTI_MAX_INSTANCES; i++)
        L3: if (!_vehicle_imu_status_sub.ChangeInstance(i))
        L3: if (_vehicle_imu_status_sub.copy(&imu_status) && (imu_status.accel_device_id == _selected_accel_device_id))
L1: if (updated)
    L2: if (_vehicle_imu_status_sub.copy(&imu_status))
        L3: if ((imu_status.accel_device_id != 0) && (imu_status.accel_device_id == _selected_accel_device_id))
```

| ID | Level | 분기 조건 | 설명 | 커버리지 요구사항 |
|----|-------|----------|------|------------------|
| FD-12 | L1 | `_sensor_selection_sub.updated()` | 센서 선택 업데이트 | True/False 모두 필요 |
| FD-13 | L2 | `_sensor_selection_sub.copy(&selection)` | 센서 선택 복사 성공 | True/False 독립 필요 (L1=True 조건 하에) |
| FD-14 | L1 | `imu_status.accel_device_id != _selected_accel_device_id` | 가속도계 ID 불일치 | True/False 모두 필요 |
| FD-15 | L3 | `!_vehicle_imu_status_sub.ChangeInstance(i)` | IMU 인스턴스 변경 실패 | True(continue)/False 필요 (L1=True 조건 하에) |
| FD-16 | L3 | `_vehicle_imu_status_sub.copy(&imu_status) && (imu_status.accel_device_id == _selected_accel_device_id)` | IMU 데이터 복사 및 ID 일치 | True(break)/False 독립 필요 (L1=True 조건 하에) |
| FD-17 | L1 | `updated` | IMU 상태 업데이트 플래그 | True/False 모두 필요 |
| FD-18 | L2 | `_vehicle_imu_status_sub.copy(&imu_status)` | IMU 상태 복사 | True/False 독립 필요 (L1=True 조건 하에) |
| FD-19 | L3 | `(imu_status.accel_device_id != 0) && (imu_status.accel_device_id == _selected_accel_device_id)` | 유효한 가속도계 ID 확인 | True/False 독립 필요 (L2=True 조건 하에) |

#### E. FailureDetector::updateMotorStatus() - 모터 상태 감지
**분기 구조 분석:**
```
L1: if (vehicle_status.arming_state == ARMING_STATE_ARMED)
    L2: for (int esc_status_idx = 0; esc_status_idx < limited_esc_count; esc_status_idx++)
        L3: if (i_esc >= actuator_motors_s::NUM_CONTROLS)
        L3: if (!(_motor_failure_esc_valid_current_mask & (1 << i_esc)) && cur_esc_report.esc_current > 0.0f)
        L3: if (esc_was_valid && esc_timed_out && !esc_timeout_currently_flagged)
        L3: else if (!esc_timed_out && esc_timeout_currently_flagged)
        L3: if (cur_esc_report.esc_current > FLT_EPSILON)
        L3: if (_motor_failure_esc_has_current[i_esc])
            L4: if (PX4_ISFINITE(actuator_motors.control[i_esc]))
            L4: if (throttle_above_threshold && current_too_low && !esc_timed_out)
                L5: if (_motor_failure_undercurrent_start_time[i_esc] == 0)
            L4: else
                L5: if (_motor_failure_undercurrent_start_time[i_esc] != 0)
            L4: if (_motor_failure_undercurrent_start_time[i_esc] != 0 && duration > threshold && not_flagged)
    L2: if (critical_esc_failure && !(_status.flags.motor))
    L2: else if (!critical_esc_failure && _status.flags.motor)
L1: else (Disarmed)
    L2: for (int i_esc = 0; i_esc < actuator_motors_s::NUM_CONTROLS; i_esc++)
```

| ID | Level | 분기 조건 | 설명 | 커버리지 요구사항 |
|----|-------|----------|------|------------------|
| FD-20 | L1 | `vehicle_status.arming_state == ARMING_STATE_ARMED` | 무장 상태 확인 | True/False 모두 필요 |
| FD-21 | L3 | `i_esc >= actuator_motors_s::NUM_CONTROLS` | ESC 인덱스 범위 초과 | True(continue)/False 필요 |
| FD-22 | L3 | `!(_motor_failure_esc_valid_current_mask & (1 << i_esc)) && cur_esc_report.esc_current > 0.0f` | 유효한 전류 텔레메트리 감지 | True/False 독립 필요 |
| FD-23 | L3 | `esc_was_valid && esc_timed_out && !esc_timeout_currently_flagged` | ESC 타임아웃 감지 | True/False 독립 필요 |
| FD-24 | L3 | `!esc_timed_out && esc_timeout_currently_flagged` | ESC 타임아웃 복구 | True/False 독립 필요 |
| FD-25 | L3 | `cur_esc_report.esc_current > FLT_EPSILON` | ESC 전류 존재 확인 | True/False 독립 필요 |
| FD-26 | L3 | `_motor_failure_esc_has_current[i_esc]` | ESC 전류 이력 확인 | True/False 독립 필요 |
| FD-27 | L4 | `PX4_ISFINITE(actuator_motors.control[i_esc])` | 액추에이터 제어값 유한성 | True/False (L3=True 조건 하에) |
| FD-28 | L4 | `throttle_above_threshold && current_too_low && !esc_timed_out` | 저전류 조건 | True/False (L3=True 조건 하에) |
| FD-29 | L5 | `_motor_failure_undercurrent_start_time[i_esc] == 0` | 저전류 시작 시간 미설정 | True/False (L4=True 조건 하에) |
| FD-30 | L5 | `_motor_failure_undercurrent_start_time[i_esc] != 0` | 저전류 시작 시간 설정됨 | True/False (L4=False 조건 하에) |
| FD-31 | L4 | `_motor_failure_undercurrent_start_time[i_esc] != 0 && duration > threshold && not_flagged` | 저전류 지속 시간 초과 | True/False (L3=True 조건 하에) |
| FD-32 | L2 | `critical_esc_failure && !(_status.flags.motor)` | 치명적 ESC 실패 감지 | True/False (L1=True 조건 하에) |
| FD-33 | L2 | `!critical_esc_failure && _status.flags.motor` | ESC 실패 복구 | True/False (L1=True 조건 하에) |

## 2. 시험 케이스 설계

### 2.1 FailureInjector 시험 케이스

#### TC-FI-001: 모터 실패 주입 명령 처리
**목적**: FailureInjector의 모든 명령 처리 분기 커버
**커버할 분기**: FI-01 ~ FI-13

**시험 단계**:
1. **Setup**: FailureInjector 객체 생성, Mock uORB 설정
2. **Test Data**:
   ```cpp
   vehicle_command_s cmd_ok_all = {
       .command = vehicle_command_s::VEHICLE_CMD_INJECT_FAILURE,
       .param1 = vehicle_command_s::FAILURE_UNIT_SYSTEM_MOTOR,
       .param2 = vehicle_command_s::FAILURE_TYPE_OK,
       .param3 = 0  // All motors
   };

   vehicle_command_s cmd_off_single = {
       .command = vehicle_command_s::VEHICLE_CMD_INJECT_FAILURE,
       .param1 = vehicle_command_s::FAILURE_UNIT_SYSTEM_MOTOR,
       .param2 = vehicle_command_s::FAILURE_TYPE_OFF,
       .param3 = 1  // Motor 1
   };

   vehicle_command_s cmd_wrong_all = {
       .command = vehicle_command_s::VEHICLE_CMD_INJECT_FAILURE,
       .param1 = vehicle_command_s::FAILURE_UNIT_SYSTEM_MOTOR,
       .param2 = vehicle_command_s::FAILURE_TYPE_WRONG,
       .param3 = 0  // All motors
   };

   vehicle_command_s cmd_invalid = {
       .command = vehicle_command_s::VEHICLE_CMD_NAV_WAYPOINT  // Invalid command
   };
   ```

3. **Test Steps**:
   - FI-01,02: Invalid command 전송 → continue 분기 확인
   - FI-03,04,05: OK type, all motors 명령 → 모든 모터 정상화 확인
   - FI-03,04,06: OK type, single motor 명령 → 특정 모터 정상화 확인
   - FI-03,07,08: OFF type, all motors 명령 → 모든 모터 차단 확인
   - FI-03,07,09: OFF type, single motor 명령 → 특정 모터 차단 확인
   - FI-03,10,11: WRONG type, all motors 명령 → 모든 모터 오작동 확인
   - FI-03,10,12: WRONG type, single motor 명령 → 특정 모터 오작동 확인
   - FI-13: 각 명령에 대한 ACK 메시지 발행 확인

**Expected Results**:
- 모든 명령이 올바르게 처리되고 해당 비트마스크 설정
- 유효하지 않은 명령은 무시됨
- 모든 명령에 대해 적절한 ACK 응답

#### TC-FI-002: ESC 상태 조작
**목적**: manipulateEscStatus의 모든 분기 커버
**커버할 분기**: FI-14 ~ FI-16

**시험 단계**:
1. **Setup**: ESC 상태 데이터 준비
2. **Test Data**:
   ```cpp
   esc_status_s esc_status_normal = {
       .esc_count = 4,
       .esc = {
           {.actuator_function = 101, .esc_voltage = 12.0f, .esc_current = 5.0f, .esc_rpm = 3000},
           {.actuator_function = 102, .esc_voltage = 12.0f, .esc_current = 5.0f, .esc_rpm = 3000},
           {.actuator_function = 103, .esc_voltage = 12.0f, .esc_current = 5.0f, .esc_rpm = 3000},
           {.actuator_function = 104, .esc_voltage = 12.0f, .esc_current = 5.0f, .esc_rpm = 3000}
       },
       .esc_online_flags = 0x0F
   };
   ```

3. **Test Steps**:
   - FI-14: _esc_blocked = 0, _esc_wrong = 0 → 조작 없음 확인
   - FI-14,15: _esc_blocked = 0x01 → ESC 0 차단 시뮬레이션 확인
   - FI-14,16: _esc_wrong = 0x02 → ESC 1 오작동 시뮬레이션 확인
   - FI-14,15,16: 복합 조작 → 차단과 오작동 동시 적용 확인

**Expected Results**:
- 차단된 ESC는 모든 값이 0으로 설정
- 오작동 ESC는 전압/전류 0.1배, RPM 10배 스케일링
- esc_online_flags에서 오프라인 ESC 마스크 제거

### 2.2 FailureDetector 시험 케이스

#### TC-FD-001: 메인 업데이트 함수
**목적**: update() 함수의 모든 분기 커버
**커버할 분기**: FD-01 ~ FD-05

**시험 단계**:
1. **Setup**: FailureDetector 객체, Mock 파라미터 설정
2. **Test Data**:
   ```cpp
   vehicle_status_s vehicle_status = {
       .arming_state = vehicle_status_s::ARMING_STATE_ARMED
   };

   vehicle_control_mode_s control_mode_enabled = {
       .flag_control_attitude_enabled = true
   };

   vehicle_control_mode_s control_mode_disabled = {
       .flag_control_attitude_enabled = false
   };

   esc_status_s esc_status = {
       .esc_count = 4
   };
   ```

3. **Test Steps**:
   - FD-01: attitude control enabled → updateAttitudeStatus 호출 확인
   - FD-01: attitude control disabled → attitude flags false 설정 확인
   - FD-02: ESC status update 성공/실패 시나리오
   - FD-03: ESC enable parameter true/false 시나리오
   - FD-04: Actuator enable parameter true/false 시나리오
   - FD-05: Imbalanced prop threshold > 0 / = 0 시나리오

**Expected Results**:
- 각 조건에 따른 적절한 서브함수 호출
- 상태 변화 반환값 정확성
- 파라미터 설정에 따른 기능 활성화/비활성화

#### TC-FD-002: 자세 실패 감지
**목적**: updateAttitudeStatus의 모든 분기 커버 (레벨별 분석 기반)
**커버할 분기**: FD-06(L1) ~ FD-09(L3)

**시험 단계**:
1. **Setup**: Mock attitude data, 파라미터 설정
2. **Test Data**:
   ```cpp
   vehicle_attitude_s attitude_normal = {
       .q = {1.0f, 0.0f, 0.0f, 0.0f}  // No rotation
   };

   vehicle_attitude_s attitude_roll_failure = {
       .q = {0.707f, 0.707f, 0.0f, 0.0f}  // 90° roll
   };

   vehicle_status_s vtol_tailsitter_transition = {
       .is_vtol_tailsitter = true,
       .in_transition_mode = true
   };

   vehicle_status_s vtol_tailsitter_fw = {
       .is_vtol_tailsitter = true,
       .in_transition_mode = false,
       .vehicle_type = vehicle_status_s::VEHICLE_TYPE_FIXED_WING
   };
   ```

3. **레벨별 시험 단계**:
   - **L1 커버리지 (FD-06)**: 
     - True: attitude update 성공 → L2 단계 진입
     - False: attitude update 실패 → 함수 종료
   - **L2 커버리지 (FD-07)** (L1=True 조건 하에):
     - True: VTOL tailsitter → L3 단계 진입
     - False: Normal vehicle → 일반 자세 처리
   - **L3 커버리지 (FD-08)** (L2=True 조건 하에):
     - True: Transition mode → roll/pitch = 0 설정
     - False: 다음 L3 조건 검사
   - **L3 커버리지 (FD-09)** (L2=True, FD-08=False 조건 하에):
     - True: Fixed-wing mode → 90° 회전 적용
     - False: 기본 VTOL 자세 사용

**Expected Results**:
- 모든 레벨의 True/False 분기 커버리지 달성
- Tailsitter 모드별 올바른 각도 계산
- 임계값 초과 시 실패 플래그 설정
- 히스테리시스 필터 정상 동작

#### TC-FD-003: ESC 상태 감지
**목적**: updateEscsStatus의 모든 분기 커버 (레벨별 분석 기반)
**커버할 분기**: FD-10(L1), FD-11(L2)

**시험 단계**:
1. **Setup**: ESC 상태 데이터, 무장 상태 설정
2. **Test Data**:
   ```cpp
   vehicle_status_s armed_status = {
       .arming_state = vehicle_status_s::ARMING_STATE_ARMED
   };

   vehicle_status_s disarmed_status = {
       .arming_state = vehicle_status_s::ARMING_STATE_DISARMED
   };

   esc_status_s esc_all_armed = {
       .esc_count = 4,
       .esc_armed_flags = 0x0F,  // All ESCs armed
       .esc = {{.failures = 0}, {.failures = 0}, {.failures = 0}, {.failures = 0}}
   };

   esc_status_s esc_failure = {
       .esc_count = 4,
       .esc_armed_flags = 0x0E,  // ESC 0 not armed
       .esc = {{.failures = 1}, {.failures = 0}, {.failures = 0}, {.failures = 0}}
   };
   ```

3. **레벨별 시험 단계**:
   - **L1 커버리지 (FD-10)**:
     - True: Armed state → ESC 실패 검사 수행, L2 단계 진입
     - False: Disarmed state → ESC 플래그 리셋, 함수 종료
   - **L2 커버리지 (FD-11)** (L1=True 조건 하에):
     - True: ESC failure detected → arm_escs flag 설정
     - False: No ESC failure → arm_escs flag 유지

**Expected Results**:
- 모든 레벨의 True/False 분기 커버리지 달성
- 무장 상태에서만 ESC 실패 감지 동작
- ESC 실패 시 arm_escs 플래그 설정
- 비무장 상태에서 플래그 리셋

#### TC-FD-004: 불균형 프로펠러 감지
**목적**: updateImbalancedPropStatus의 모든 분기 커버 (레벨별 분석 기반)
**커버할 분기**: FD-12(L1) ~ FD-19(L3)

**시험 단계**:
1. **Setup**: IMU 상태 데이터, 센서 선택 데이터
2. **Test Data**:
   ```cpp
   sensor_selection_s sensor_selection = {
       .accel_device_id = 12345
   };

   vehicle_imu_status_s imu_status_valid = {
       .accel_device_id = 12345,
       .timestamp = 1000000,
       .var_accel = {0.1f, 0.1f, 0.05f}  // Imbalanced condition
   };

   vehicle_imu_status_s imu_status_different_id = {
       .accel_device_id = 54321,
       .timestamp = 1000000,
       .var_accel = {0.05f, 0.05f, 0.05f}
   };
   ```

3. **레벨별 시험 단계**:
   - **L1 커버리지 (FD-12)**:
     - True: Sensor selection updated → L2 단계 진입
     - False: No sensor update → 다음 L1 조건 검사
   - **L2 커버리지 (FD-13)** (L1=True 조건 하에):
     - True: Sensor selection copy success → device ID 업데이트
     - False: Copy failed → device ID 유지
   - **L1 커버리지 (FD-14)**:
     - True: IMU device ID mismatch → L2 instance search 수행
     - False: ID match → 다음 L1 조건 검사
   - **L3 커버리지 (FD-15)** (L1=True 조건 하에):
     - True: Instance change failed → continue
     - False: Instance change success → L3 다음 조건 검사
   - **L3 커버리지 (FD-16)** (L1=True 조건 하에):
     - True: IMU copy success & ID match → break
     - False: IMU copy failed or ID mismatch → 계속 루프
   - **L1 커버리지 (FD-17)**:
     - True: IMU updated → L2 단계 진입
     - False: No IMU update → 함수 종료
   - **L2 커버리지 (FD-18)** (L1=True 조건 하에):
     - True: IMU copy success → L3 단계 진입
     - False: IMU copy failed → 함수 종료
   - **L3 커버리지 (FD-19)** (L2=True 조건 하에):
     - True: Valid accel device ID → 불균형 계산 수행
     - False: Invalid device ID → 계산 스키

**Expected Results**:
- 모든 레벨의 True/False 분기 커버리지 달성
- 센서 선택 변경 시 올바른 IMU 인스턴스 선택
- 불균형 메트릭 정확한 계산
- 임계값 기반 플래그 설정

#### TC-FD-005: 모터 상태 감지
**목적**: updateMotorStatus의 모든 분기 커버
**커버할 분기**: FD-20 ~ FD-33

**시험 단계**:
1. **Setup**: ESC 리포트 데이터, 액추에이터 모터 데이터
2. **Test Data**:
   ```cpp
   vehicle_status_s armed_status = {
       .arming_state = vehicle_status_s::ARMING_STATE_ARMED
   };

   esc_status_s esc_status_normal = {
       .esc_count = 2,
       .esc = {
           {
               .actuator_function = actuator_motors_s::ACTUATOR_FUNCTION_MOTOR1,
               .timestamp = 1000000,
               .esc_current = 5.0f
           },
           {
               .actuator_function = actuator_motors_s::ACTUATOR_FUNCTION_MOTOR2,
               .timestamp = 1000000,
               .esc_current = 5.0f
           }
       }
   };

   esc_status_s esc_status_timeout = {
       .esc_count = 1,
       .esc = {
           {
               .actuator_function = actuator_motors_s::ACTUATOR_FUNCTION_MOTOR1,
               .timestamp = 500000,  // Old timestamp (timeout)
               .esc_current = 5.0f
           }
       }
   };

   actuator_motors_s actuator_motors = {
       .control = {0.8f, 0.7f, 0.0f, 0.0f}  // High throttle on motors 1&2
   };
   ```

3. **Test Steps**:
   - FD-20: Armed/Disarmed state handling
   - FD-21: ESC index out of range → continue 확인
   - FD-22: Valid current telemetry detection
   - FD-23,24: ESC timeout detection and recovery
   - FD-25,26: ESC current existence check
   - FD-27: Finite actuator control value check
   - FD-28,29,30: Under-current condition detection
   - FD-31: Under-current duration threshold
   - FD-32,33: Critical ESC failure flag management

**Expected Results**:
- 무장 상태에서만 모터 감지 수행
- 텔레메트리 타임아웃 정확한 감지
- 저전류 조건 및 지속 시간 정확한 측정
- 치명적 실패 시 motor flag 설정

### 2.3 통합 시험 케이스

#### TC-INT-001: 전체 시스템 통합 시험
**목적**: 모든 모듈이 함께 동작하는 시나리오 검증

**시험 시나리오**:
1. **정상 동작**: 모든 센서 정상, 실패 없음
2. **자세 실패**: 과도한 롤/피치 발생
3. **ESC 실패**: ESC 무장 실패, 텔레메트리 타임아웃
4. **모터 실패**: 저전류 조건, 텔레메트리 손실
5. **불균형 프로펠러**: IMU 진동 증가
6. **복합 실패**: 여러 실패 조건 동시 발생
7. **실패 주입**: 인위적 실패 주입 후 복구

**각 시나리오별 검증 항목**:
- 올바른 실패 플래그 설정
- 히스테리시스 필터 동작
- 상태 변화 감지
- 로그 메시지 출력
- 파라미터 설정 반영

## 3. 시험 환경 설정

### 3.1 Mock 객체 설정
```cpp
class MockSubscription : public uORB::Subscription {
public:
    bool update(void* data) override {
        if (mock_data_available) {
            memcpy(data, &mock_data, mock_data_size);
            mock_data_available = false;
            return true;
        }
        return false;
    }

    void setMockData(const void* data, size_t size) {
        memcpy(&mock_data, data, size);
        mock_data_size = size;
        mock_data_available = true;
    }

private:
    uint8_t mock_data[1024];
    size_t mock_data_size;
    bool mock_data_available = false;
};
```

### 3.2 시험 픽스처
```cpp
class FailureDetectorTest {
private:
    FailureDetector* detector;
    MockSubscription* attitude_sub;
    MockSubscription* esc_sub;
    MockSubscription* imu_sub;
    MockSubscription* sensor_selection_sub;
    MockSubscription* actuator_motors_sub;

public:
    void SetUp() {
        // Mock objects initialization
        detector = new FailureDetector(nullptr);
        // Inject mock subscriptions
    }

    void TearDown() {
        delete detector;
    }

    void setParameter(const char* name, float value) {
        // Parameter setting logic
    }

    void simulateTime(uint64_t time_us) {
        // Time simulation logic
    }
};
```

## 4. 커버리지 검증

### 4.1 커버리지 메트릭
- **라인 커버리지**: 100% (모든 코드 라인 실행)
- **분기 커버리지**: 100% (모든 if/else 분기 실행)
- **함수 커버리지**: 100% (모든 함수 호출)
- **조건 커버리지**: 100% (모든 boolean 조건의 true/false)

### 4.2 커버리지 도구
- **gcov**: 라인 및 분기 커버리지 측정
- **lcov**: HTML 리포트 생성
- **gcovr**: XML/JSON 리포트 생성

### 4.3 커버리지 실행 명령
```bash
# 컴파일 (커버리지 플래그 포함)
g++ -fprofile-arcs -ftest-coverage -o test_failure_detector test_failure_detector.cpp

# 테스트 실행
./test_failure_detector

# 커버리지 리포트 생성
gcov test_failure_detector.cpp
lcov --capture --directory . --output-file coverage.info
genhtml coverage.info --output-directory coverage_report
```

## 5. 시험 결과 예상

### 5.1 성공 조건
- 모든 시험 케이스 PASS
- 코드 커버리지 100% 달성
- 메모리 누수 없음
- 모든 assert 통과

### 5.2 실패 조건 처리
- 각 실패 조건별 명확한 오류 메시지
- 실패 발생 시 상세한 디버깅 정보 제공
- 회귀 테스트를 위한 실패 케이스 보존

## 6. 시험 자동화

### 6.1 CI/CD 통합
```yaml
# .github/workflows/test.yml
name: FailureDetector Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build and Test
        run: |
          mkdir build && cd build
          cmake -DCOVERAGE=ON ..
          make -j4
          ./test_failure_detector
          make coverage
      - name: Upload Coverage
        uses: codecov/codecov-action@v1
```

### 6.2 테스트 실행 스크립트
```bash
#!/bin/bash
# run_tests.sh

set -e

echo "Building FailureDetector tests..."
mkdir -p build
cd build
cmake -DCOVERAGE=ON -DCMAKE_BUILD_TYPE=Debug ..
make -j$(nproc)

echo "Running tests..."
./test_failure_detector --gtest_output=xml:test_results.xml

echo "Generating coverage report..."
make coverage

echo "Test summary:"
echo "============="
grep -E "(PASSED|FAILED)" test_results.xml | wc -l
echo "Coverage: $(lcov --summary coverage.info | grep lines | awk '{print $2}')"

echo "Done!"
```

## 7. 실제 타겟 보드 기반 시험

### 7.1 하드웨어 시험 환경
- **타겟 보드**: PX4 호환 플랫폼 (Pixhawk, CUAV 등)
- **시험 구성**: 실제 ESC, 모터, IMU, GPS 연결
- **통신**: MAVLink를 통한 원격 명령 및 모니터링
- **로깅**: uLog를 통한 실시간 데이터 수집

### 7.2 펌웨어 빌드 및 업로드

#### A. 커버리지 추적 기능 추가 펌웨어 빌드
```bash
# PX4 소스 디렉토리에서
make px4_fmu-v5_default

# 또는 특정 보드용
make px4_fmu-v6x_default

# 펌웨어 업로드
make px4_fmu-v5_default upload
```

#### B. 커버리지 추적을 위한 코드 계측
```cpp
// FailureDetector.cpp에 추가
#ifdef COVERAGE_TEST
static uint32_t coverage_bitmap[10] = {0}; // 분기 추적용
#define COVERAGE_MARK(id) coverage_bitmap[(id)/32] |= (1 << ((id)%32))
#define COVERAGE_REPORT() coverage_report()

void coverage_report() {
    PX4_INFO("=== Coverage Report ===");
    for (int i = 0; i < 320; i++) { // 총 분기 수
        if (coverage_bitmap[i/32] & (1 << (i%32))) {
            PX4_INFO("Branch %d: COVERED", i);
        }
    }
}
#else
#define COVERAGE_MARK(id)
#define COVERAGE_REPORT()
#endif
```

### 7.3 MAVLink 명령을 통한 시험 수행

#### A. 기본 시험 설정
```python
#!/usr/bin/env python3
# hardware_test.py

from pymavlink import mavutil
import time
import json

class PX4FailureTest:
    def __init__(self, connection_string='udp:127.0.0.1:14550'):
        self.master = mavutil.mavlink_connection(connection_string)
        self.coverage_results = {}

    def wait_heartbeat(self):
        """PX4 연결 대기"""
        print("Waiting for heartbeat...")
        self.master.wait_heartbeat()
        print("Heartbeat received")

    def inject_failure(self, unit, failure_type, instance):
        """실패 주입 명령 전송"""
        self.master.mav.command_long_send(
            self.master.target_system,
            self.master.target_component,
            mavutil.mavlink.MAV_CMD_INJECT_FAILURE,
            0,  # confirmation
            unit,       # param1: failure unit
            failure_type,  # param2: failure type
            instance,   # param3: instance
            0, 0, 0, 0  # param4-7: unused
        )

    def set_parameter(self, param_name, value):
        """파라미터 설정"""
        self.master.param_set_send(param_name, value)

    def arm_disarm(self, arm=True):
        """무장/해제"""
        command = mavutil.mavlink.MAV_CMD_COMPONENT_ARM_DISARM
        self.master.mav.command_long_send(
            self.master.target_system,
            self.master.target_component,
            command, 0,
            1 if arm else 0,  # arm/disarm
            0, 0, 0, 0, 0, 0
        )

    def monitor_status(self, duration=10):
        """상태 모니터링"""
        start_time = time.time()
        status_data = []

        while time.time() - start_time < duration:
            msg = self.master.recv_match(blocking=False)
            if msg:
                if msg.get_type() == 'SYS_STATUS':
                    status_data.append({
                        'timestamp': time.time(),
                        'errors_count1': msg.errors_count1,
                        'errors_count2': msg.errors_count2
                    })
            time.sleep(0.1)

        return status_data
```

#### B. 자동화 시험 시퀀스
```python
def run_comprehensive_test():
    test = PX4FailureTest()
    test.wait_heartbeat()

    print("=== Starting Hardware-based Failure Detector Test ===")

    # 1. 초기 상태 확인
    print("1. Baseline test - Normal operation")
    test.set_parameter('FD_FAIL_P', 60)  # 60도 피치 임계값
    test.set_parameter('FD_FAIL_R', 60)  # 60도 롤 임계값
    test.set_parameter('FD_ESCS_EN', 1)  # ESC 감지 활성화
    baseline = test.monitor_status(5)

    # 2. 자세 실패 시험
    print("2. Attitude failure test")
    test.set_parameter('FD_FAIL_P', 5)   # 매우 낮은 임계값으로 실패 유발
    test.set_parameter('FD_FAIL_R', 5)
    attitude_fail = test.monitor_status(10)

    # 3. ESC 실패 주입 시험
    print("3. ESC failure injection test")
    test.set_parameter('FD_FAIL_P', 60)  # 임계값 복구
    test.set_parameter('FD_FAIL_R', 60)

    # 모터 1 차단
    test.inject_failure(
        mavutil.mavlink.FAILURE_UNIT_SYSTEM_MOTOR,
        mavutil.mavlink.FAILURE_TYPE_OFF,
        1
    )
    esc_fail = test.monitor_status(10)

    # 모터 1 복구
    test.inject_failure(
        mavutil.mavlink.FAILURE_UNIT_SYSTEM_MOTOR,
        mavutil.mavlink.FAILURE_TYPE_OK,
        1
    )

    # 4. 모터 텔레메트리 시험 (실제 ESC 연결 필요)
    print("4. Motor telemetry test")
    test.arm_disarm(True)
    time.sleep(2)

    # 모터 실패 감지를 위한 파라미터 설정
    test.set_parameter('FD_ACT_EN', 1)
    test.set_parameter('FD_ACT_MOT_THR', 0.1)
    test.set_parameter('FD_ACT_MOT_C2T', 2.0)
    test.set_parameter('FD_ACT_MOT_TOUT', 500)

    motor_test = test.monitor_status(15)
    test.arm_disarm(False)

    # 5. 불균형 프로펠러 시험
    print("5. Imbalanced propeller test")
    test.set_parameter('FD_IMB_PROP_THR', 100)  # 낮은 임계값
    imbalance_test = test.monitor_status(10)

    print("=== Test Complete ===")

    # 결과 저장
    results = {
        'baseline': baseline,
        'attitude_failure': attitude_fail,
        'esc_failure': esc_fail,
        'motor_telemetry': motor_test,
        'imbalanced_prop': imbalance_test
    }

    with open('hardware_test_results.json', 'w') as f:
        json.dump(results, f, indent=2)

if __name__ == "__main__":
    run_comprehensive_test()
```

### 7.4 실시간 로그 분석

#### A. uLog 데이터 수집
```bash
# 로그 다운로드 (SD 카드 또는 MAVLink를 통해)
# 로그 파일: /log/session001/log001.ulg

# uLog 데이터 추출
ulog2csv log001.ulg

# FailureDetector 관련 토픽 확인
ls *failure_detector*
ls *vehicle_status*
ls *esc_status*
```

#### B. 로그 분석 스크립트
```python
#!/usr/bin/env python3
# log_analyzer.py

import pandas as pd
import matplotlib.pyplot as plt
import numpy as np

def analyze_failure_detector_log():
    # CSV 파일 로드
    try:
        vehicle_status = pd.read_csv('vehicle_status_0.csv')
        esc_status = pd.read_csv('esc_status_0.csv')
        vehicle_attitude = pd.read_csv('vehicle_attitude_0.csv')
    except FileNotFoundError as e:
        print(f"Log file not found: {e}")
        return

    # 시간 동기화
    base_time = min(vehicle_status['timestamp'].min(),
                   esc_status['timestamp'].min(),
                   vehicle_attitude['timestamp'].min())

    vehicle_status['time_sec'] = (vehicle_status['timestamp'] - base_time) / 1e6
    esc_status['time_sec'] = (esc_status['timestamp'] - base_time) / 1e6
    vehicle_attitude['time_sec'] = (vehicle_attitude['timestamp'] - base_time) / 1e6

    # 1. 자세 실패 분석
    fig, axes = plt.subplots(3, 1, figsize=(12, 10))

    # 롤/피치 각도
    axes[0].plot(vehicle_attitude['time_sec'],
                np.degrees(vehicle_attitude['roll']), label='Roll')
    axes[0].plot(vehicle_attitude['time_sec'],
                np.degrees(vehicle_attitude['pitch']), label='Pitch')
    axes[0].axhline(y=60, color='r', linestyle='--', label='Threshold')
    axes[0].axhline(y=-60, color='r', linestyle='--')
    axes[0].set_ylabel('Angle (degrees)')
    axes[0].set_title('Attitude Failure Detection')
    axes[0].legend()
    axes[0].grid(True)

    # ESC 상태
    if 'esc_armed_flags' in esc_status.columns:
        axes[1].plot(esc_status['time_sec'], esc_status['esc_armed_flags'])
        axes[1].set_ylabel('ESC Armed Flags')
        axes[1].set_title('ESC Status')
        axes[1].grid(True)

    # 무장 상태 및 실패 플래그
    if 'arming_state' in vehicle_status.columns:
        axes[2].plot(vehicle_status['time_sec'], vehicle_status['arming_state'])
        axes[2].set_ylabel('Arming State')
        axes[2].set_xlabel('Time (sec)')
        axes[2].set_title('Vehicle Arming State')
        axes[2].grid(True)

    plt.tight_layout()
    plt.savefig('failure_detector_analysis.png', dpi=300)
    plt.show()

    # 2. 커버리지 분석
    analyze_coverage_from_log(vehicle_status, esc_status, vehicle_attitude)

def analyze_coverage_from_log(vehicle_status, esc_status, vehicle_attitude):
    """로그 데이터에서 코드 커버리지 추정"""
    coverage_report = {}

    # FD-01: 자세 제어 활성화 여부
    attitude_control_changes = len(vehicle_status) > 0
    coverage_report['FD-01'] = attitude_control_changes

    # FD-02: ESC 상태 업데이트 여부
    esc_updates = len(esc_status) > 0
    coverage_report['FD-02'] = esc_updates

    # FD-06: 자세 데이터 업데이트 여부
    attitude_updates = len(vehicle_attitude) > 0
    coverage_report['FD-06'] = attitude_updates

    # FD-07: VTOL tailsitter 감지 (로그에서 확인)
    if 'is_vtol_tailsitter' in vehicle_status.columns:
        tailsitter_detected = vehicle_status['is_vtol_tailsitter'].any()
        coverage_report['FD-07'] = tailsitter_detected

    # FD-10: 무장 상태 변화
    if 'arming_state' in vehicle_status.columns:
        arming_changes = vehicle_status['arming_state'].nunique() > 1
        coverage_report['FD-10'] = arming_changes

    # 커버리지 리포트 출력
    print("\n=== Coverage Analysis from Log ===")
    covered_branches = sum(coverage_report.values())
    total_branches = len(coverage_report)

    for branch, covered in coverage_report.items():
        status = "✓ COVERED" if covered else "✗ NOT COVERED"
        print(f"{branch}: {status}")

    print(f"\nCoverage: {covered_branches}/{total_branches} "
          f"({100*covered_branches/total_branches:.1f}%)")

if __name__ == "__main__":
    analyze_failure_detector_log()
```

### 7.5 물리적 시험 시나리오

#### A. 자세 실패 시험
```bash
# 1. 실제 기체를 손으로 기울여 롤/피치 실패 유발
# 2. 파라미터를 낮게 설정하여 쉽게 실패 조건 달성
# 3. QGroundControl을 통해 실시간 상태 모니터링

param set FD_FAIL_P 10    # 10도로 낮은 임계값 설정
param set FD_FAIL_R 10    # 10도로 낮은 임계값 설정
param set FD_FAIL_P_TTRI 2.0  # 2초 지속 시간
param set FD_FAIL_R_TTRI 2.0  # 2초 지속 시간
```

#### B. ESC/모터 실패 시험
```bash
# 1. ESC 실패 감지 활성화
param set FD_ESCS_EN 1
param set FD_ACT_EN 1

# 2. 모터 실패 감지 파라미터 설정
param set FD_ACT_MOT_THR 0.1     # 10% 스로틀 임계값
param set FD_ACT_MOT_C2T 2.0     # 전류/스로틀 비율
param set FD_ACT_MOT_TOUT 500    # 500ms 타임아웃

# 3. 실제 ESC 연결 해제 또는 전원 차단으로 실패 유발
# 4. 명령을 통한 실패 주입
failure inject motor 1 off      # 모터 1 차단
failure inject motor 1 ok       # 모터 1 복구
```

#### C. 불균형 프로펠러 시험
```bash
# 1. 불균형 프로펠러 감지 활성화
param set FD_IMB_PROP_THR 50   # 낮은 임계값으로 설정

# 2. 물리적으로 프로펠러 불균형 생성
#    - 한쪽 프로펠러에 테이프 부착
#    - 프로펠러 하나만 제거
#    - 서로 다른 크기의 프로펠러 장착

# 3. 모터 회전 시 진동 데이터 모니터링
```

### 7.6 실시간 모니터링 대시보드

#### A. QGroundControl 커스텀 위젯
```qml
// FailureDetectorWidget.qml
import QtQuick 2.0
import QtQuick.Controls 2.0

Rectangle {
    width: 300
    height: 200
    color: "lightgray"

    Column {
        anchors.fill: parent
        anchors.margins: 10
        spacing: 5

        Text {
            text: "Failure Detector Status"
            font.bold: true
            font.pixelSize: 16
        }

        Row {
            Text { text: "Roll Failure: " }
            Rectangle {
                width: 20; height: 20
                color: rollFailure ? "red" : "green"
                property bool rollFailure: false
            }
        }

        Row {
            Text { text: "Pitch Failure: " }
            Rectangle {
                width: 20; height: 20
                color: pitchFailure ? "red" : "green"
                property bool pitchFailure: false
            }
        }

        Row {
            Text { text: "ESC Failure: " }
            Rectangle {
                width: 20; height: 20
                color: escFailure ? "red" : "green"
                property bool escFailure: false
            }
        }

        Row {
            Text { text: "Motor Failure: " }
            Rectangle {
                width: 20; height: 20
                color: motorFailure ? "red" : "green"
                property bool motorFailure: false
            }
        }
    }
}
```

#### B. 실시간 로깅 명령
```bash
# PX4 콘솔에서 실시간 로그 확인
listener vehicle_status
listener esc_status
listener vehicle_attitude

# 특정 토픽의 실패 상태만 모니터링
listener vehicle_status | grep -E "(roll|pitch|motor|esc)"

# 커버리지 정보 출력 (커버리지 추적 코드가 추가된 경우)
failure_detector coverage_report
```

### 7.7 HIL(Hardware-in-the-Loop) 시험 케이스

#### A. HIL 시험 환경 구성
**HIL 시험의 장점:**
- 실제 PX4 펌웨어를 타겟 보드에서 실행
- 시뮬레이션된 센서 데이터로 정확한 조건 제어
- 실제 하드웨어 타이밍과 인터럽트 동작
- 디버깅과 로깅이 용이

**시험 구성:**
```
[PC - Gazebo Simulator] <--> [SITL Bridge] <--> [PX4 Hardware]
                                   ↓
                            [MAVLink Commands]
                                   ↓
                        [FailureDetector Coverage]
```

#### B. HIL 환경 설정

##### B.1 PX4 펌웨어 빌드 (HIL 모드)
```bash
# HIL 전용 펌웨어 빌드
make px4_fmu-v5_default

# 또는 커버리지 추적 기능 포함
make px4_fmu-v5_default EXTRA_CMAKE_CXX_FLAGS="-DCOVERAGE_TEST=1"

# 펌웨어 업로드
make px4_fmu-v5_default upload
```

##### B.2 Gazebo HIL 시뮬레이션 설정
```bash
# Gazebo 시뮬레이션 시작 (별도 터미널)
cd PX4-Autopilot
PX4_SIM_MODEL=gz_x500 make px4_sitl_default gazebo

# HIL 브릿지 연결
px4-hil-bridge --target-ip 192.168.1.100  # 실제 하드웨어 IP
```

##### B.3 QGroundControl HIL 연결
```
1. QGC 실행
2. Communication Links 설정
   - Type: Serial
   - Port: /dev/ttyUSB0 (하드웨어)
   - Baud: 57600
3. HIL 모드 활성화
   - Vehicle Setup > Safety
   - HIL Enabled: True
```

#### C. HIL 분기별 시험 케이스

##### C.1 FailureInjector HIL 시험
**목적**: FI-01 ~ FI-16 분기 커버리지 달성

```python
#!/usr/bin/env python3
# hil_failure_injector_test.py

import time
from pymavlink import mavutil
import json

class HILFailureInjectorTest:
    def __init__(self):
        # HIL 하드웨어 연결
        self.master = mavutil.mavlink_connection('/dev/ttyUSB0', baud=57600)
        self.coverage_data = {}
        
    def test_motor_failure_injection_branches(self):
        """모터 실패 주입 분기 테스트"""
        print("=== HIL FailureInjector Branch Coverage Test ===")
        
        branch_tests = [
            # FI-01, FI-02: 명령 구독 및 유효성 검사
            {
                'name': 'FI-01_02_Invalid_Command',
                'command': mavutil.mavlink.MAV_CMD_NAV_WAYPOINT,  # 잘못된 명령
                'expected_branch': 'FI-02_True_Continue',
                'description': 'L2: 잘못된 명령으로 continue 분기 테스트'
            },
            
            # FI-03, FI-04, FI-05: 모든 모터 정상화
            {
                'name': 'FI-03_04_05_All_Motors_OK',
                'command': mavutil.mavlink.MAV_CMD_INJECT_FAILURE,
                'params': [mavutil.mavlink.FAILURE_UNIT_SYSTEM_MOTOR, 
                          mavutil.mavlink.FAILURE_TYPE_OK, 0],
                'expected_branch': 'FI-05_True_All_Motors',
                'description': 'L4: instance==0 조건으로 모든 모터 정상화'
            },
            
            # FI-03, FI-04, FI-06: 특정 모터 정상화
            {
                'name': 'FI-03_04_06_Single_Motor_OK',
                'command': mavutil.mavlink.MAV_CMD_INJECT_FAILURE,
                'params': [mavutil.mavlink.FAILURE_UNIT_SYSTEM_MOTOR, 
                          mavutil.mavlink.FAILURE_TYPE_OK, 1],
                'expected_branch': 'FI-06_True_Single_Motor',
                'description': 'L4: instance>=1 조건으로 모터1 정상화'
            },
            
            # FI-03, FI-07, FI-08: 모든 모터 차단
            {
                'name': 'FI-03_07_08_All_Motors_OFF',
                'command': mavutil.mavlink.MAV_CMD_INJECT_FAILURE,
                'params': [mavutil.mavlink.FAILURE_UNIT_SYSTEM_MOTOR, 
                          mavutil.mavlink.FAILURE_TYPE_OFF, 0],
                'expected_branch': 'FI-08_True_All_Motors_Block',
                'description': 'L4: 모든 모터 차단 분기 테스트'
            },
            
            # 추가 테스트 케이스들...
        ]
        
        for test in branch_tests:
            print(f"\n--- {test['name']} ---")
            print(f"Description: {test['description']}")
            
            # 명령 전송 및 응답 대기
            self.send_and_monitor_command(test)
            time.sleep(1)
            
        return self.coverage_data

if __name__ == "__main__":
    test = HILFailureInjectorTest()
    results = test.test_motor_failure_injection_branches()
    
    with open('hil_failure_injector_coverage.json', 'w') as f:
        json.dump(results, f, indent=2)
```

##### C.2 Motor Status HIL 시험 (5단계 중첩 구조)
**목적**: FD-20 ~ FD-33 분기 커버리지 달성

```python
#!/usr/bin/env python3
# hil_motor_test.py

class HILMotorTest:
    def test_motor_status_branches(self):
        """모터 상태 감지 분기 테스트 (L1-L5)"""
        print("=== HIL Motor Status Branch Coverage Test ===")
        
        motor_tests = [
            # L1: FD-20 False - 비무장 상태
            {
                'name': 'FD-20_False_Disarmed',
                'arming_state': 'DISARMED',
                'expected_branches': ['FD-20_False', 'Disarmed_Cleanup'],
                'description': 'L1: 비무장 상태에서 모터 감지 비활성화 및 정리'
            },
            
            # L3: FD-21 True - ESC 인덱스 범위 초과  
            {
                'name': 'FD-21_True_ESC_Index_Overflow',
                'arming_state': 'ARMED',
                'esc_config': 'invalid_function_index',
                'expected_branches': ['FD-20_True', 'FD-21_True_Continue'],
                'description': 'L3: ESC 인덱스 범위 초과로 continue 분기'
            },
            
            # L4-L5: FD-28, FD-29 저전류 조건 중첩 테스트
            {
                'name': 'FD-28_29_Low_Current_Nested',
                'arming_state': 'ARMED',
                'esc_data': {
                    'throttle': 0.8,  # L4: FD-28 True 조건
                    'current': 1.0,   # 낮은 전류
                    'start_time': 0   # L5: FD-29 True 조건 (시작 시간 미설정)
                },
                'expected_branches': [
                    'FD-20_True_Armed',      # L1
                    'FD-26_True_Has_Current', # L3  
                    'FD-28_True_Low_Current', # L4
                    'FD-29_True_Set_Start'    # L5
                ],
                'description': 'L4-L5: 저전류 조건에서 중첩된 분기 테스트'
            },
            
            # L5: FD-30 저전류 복구 분기
            {
                'name': 'FD-30_True_Current_Recovery',
                'arming_state': 'ARMED', 
                'esc_data': {
                    'throttle': 0.3,    # L4: FD-28 False (정상 조건)
                    'start_time': 12345 # L5: FD-30 True (시작 시간 설정됨)
                },
                'expected_branches': [
                    'FD-28_False_Normal_Current', # L4
                    'FD-30_True_Reset_Time'       # L5
                ],
                'description': 'L5: 저전류 조건 해제 시 시작 시간 리셋'
            }
        ]
        
        coverage_results = {}
        
        for test in motor_tests:
            print(f"\n--- {test['name']} ---") 
            print(f"Description: {test['description']}")
            
            # 시험 환경 설정
            self.setup_test_environment(test)
            
            # 분기 모니터링 및 결과 수집
            coverage_results[test['name']] = self.monitor_motor_branches(
                test['expected_branches'], duration=3.0
            )
        
        return coverage_results
```

##### C.3 HIL 커버리지 종합 분석

```python
#!/usr/bin/env python3
# hil_coverage_analyzer.py

class HILCoverageAnalyzer:
    def __init__(self):
        self.branch_coverage_map = {
            # 레벨별 분기 매핑
            'FI-01': {'level': 1, 'condition': 'while loop update', 'covered': False},
            'FI-02': {'level': 2, 'condition': 'command type check', 'covered': False},
            # ... (모든 분기 매핑)
            
            # Motor 함수 L1-L5 분기들
            'FD-20': {'level': 1, 'condition': 'armed state check', 'covered': False},
            'FD-21': {'level': 3, 'condition': 'ESC index overflow', 'covered': False},
            'FD-28': {'level': 4, 'condition': 'low current condition', 'covered': False},
            'FD-29': {'level': 5, 'condition': 'start time unset', 'covered': False},
            'FD-30': {'level': 5, 'condition': 'start time reset', 'covered': False},
            # ...
        }
    
    def analyze_hil_coverage(self, test_results):
        """HIL 테스트 결과에서 커버리지 분석"""
        print("\n=== HIL Branch Coverage Analysis ===")
        
        # 레벨별 커버리지 분석
        level_coverage = {}
        for branch_id, branch_info in self.branch_coverage_map.items():
            level = branch_info['level']
            if level not in level_coverage:
                level_coverage[level] = {'total': 0, 'covered': 0}
            
            level_coverage[level]['total'] += 1
            if branch_info['covered']:
                level_coverage[level]['covered'] += 1
        
        # 결과 출력
        print("\n레벨별 커버리지:")
        for level in sorted(level_coverage.keys()):
            covered = level_coverage[level]['covered']
            total = level_coverage[level]['total']
            percentage = (covered / total) * 100 if total > 0 else 0
            print(f"Level {level}: {covered}/{total} ({percentage:.1f}%)")
        
        # 미커버 분기 분석
        uncovered = [bid for bid, info in self.branch_coverage_map.items() 
                    if not info['covered']]
        
        if uncovered:
            print(f"\n미커버 분기 ({len(uncovered)}개):")
            for branch_id in uncovered:
                info = self.branch_coverage_map[branch_id]
                print(f"  {branch_id} (L{info['level']}): {info['condition']}")
        
        return level_coverage
```

#### D. HIL 시험 실행 스크립트

```bash
#!/bin/bash
# run_hil_tests.sh

set -e

echo "=== PX4 FailureDetector HIL Branch Coverage Test ==="
echo "시작 시간: $(date)"

# 1. 펌웨어 빌드 및 업로드
echo "\n1. 펌웨어 빌드 및 업로드..."
make px4_fmu-v5_default EXTRA_CMAKE_CXX_FLAGS="-DCOVERAGE_TEST=1"
make px4_fmu-v5_default upload

# 2. Gazebo HIL 시뮬레이션 시작
echo "\n2. Gazebo HIL 시뮬레이션 시작..."
PX4_SIM_MODEL=gz_x500 make px4_sitl_default gazebo &
GAZEBO_PID=$!
sleep 10  # Gazebo 완전히 로드될 때까지 대기

# 3. HIL 분기 테스트 실행
echo "\n3. HIL 분기 커버리지 테스트 실행..."

# FailureInjector 테스트 (L1-L4 분기)
echo "\n3.1 FailureInjector 테스트 (4단계 중첩)..."
python3 hil_failure_injector_test.py

# Motor Status 테스트 (L1-L5 분기)  
echo "\n3.2 Motor Status 테스트 (5단계 중첩)..."
python3 hil_motor_test.py

# Attitude 테스트 (L1-L3 분기)
echo "\n3.3 Attitude Failure 테스트 (3단계 중첩)..."
python3 hil_attitude_test.py

# 4. 커버리지 분석
echo "\n4. 레벨별 분기 커버리지 분석..."
python3 hil_coverage_analyzer.py

# 5. 정리
echo "\n5. 정리..."
kill $GAZEBO_PID

echo "\n=== HIL 테스트 완료 ==="
echo "종료 시간: $(date)"
```

### 7.8 시험 결과 검증

#### A. 성공 기준
- 각 실패 조건 발생 시 해당 플래그 정확히 설정
- 히스테리시스 동작 확인 (지연 시간 준수)
- 실패 주입 명령에 대한 정확한 응답
- 로그에서 모든 분기 조건 추적 확인
- HIL 테스트에서 목표 분기 커버리지 달성 (95% 이상)

#### B. 자동화된 합/불 판정
```python
def validate_test_results():
    """시험 결과 자동 검증"""
    results = json.load(open('hardware_test_results.json'))
    hil_results = json.load(open('hil_coverage_results.json'))

    validation_results = {
        'attitude_failure_detected': False,
        'esc_failure_detected': False,
        'motor_failure_detected': False,
        'recovery_successful': False,
        'hil_branch_coverage': False
    }

    # 각 시험 단계별 결과 분석
    for test_name, data in results.items():
        if 'failure' in test_name:
            # 실패 조건에서 에러 카운트 증가 확인
            error_counts = [d['errors_count1'] for d in data if 'errors_count1' in d]
            if len(error_counts) > 1:
                if error_counts[-1] > error_counts[0]:
                    validation_results[f'{test_name}_detected'] = True
    
    # HIL 분기 커버리지 검증
    if hil_results['overall_coverage'] >= 95.0:
        validation_results['hil_branch_coverage'] = True

    # 전체 검증 결과
    passed_tests = sum(validation_results.values())
    total_tests = len(validation_results)

    print(f"\n=== Validation Results ===")
    print(f"Passed: {passed_tests}/{total_tests}")
    print(f"HIL Branch Coverage: {hil_results['overall_coverage']:.1f}%")

    if passed_tests == total_tests:
        print("✓ ALL TESTS PASSED")
        return True
    else:
        print("✗ SOME TESTS FAILED")
        return False
```

이 방식으로 실제 하드웨어에서 FailureDetector의 모든 기능을 검증하고 HIL을 통한 체계적인 분기 커버리지를 확인할 수 있습니다.
