# FailureDetector 동적 분석 보고서

## 1. 기능 구성 CLASS/File 관계

### 1.1 파일 구조
- **FailureDetector.hpp**: 클래스 정의 및 인터페이스 선언
- **FailureDetector.cpp**: 클래스 구현 및 로직

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

## 2. 함수별 분기 확인

### 2.1 전체 분기 목록 요약 (수정됨)
:::details 전체 분기 목록 표
| No | 함수명 | 분기 ID | 레벨 | 라인 | 분기 조건 | 설명 |
|---|--------|---------|------|------|-----------|------|
| 1 | getStatus() | - | L0 | 103 | return _status | 단순 반환 |
| 2 | getStatusFlags() | - | L0 | 104 | return _status.flags | 단순 반환 |
| 3 | getImbalancedPropMetric() | - | L0 | 105 | return filter.getState() | 필터 상태 반환 |
| 4 | getMotorFailures() | - | L0 | 106 | return mask_OR | 비트 OR 연산 |
| 5 | FailureInjector::update() | FI_U_01 | L1 | 49 | while(command_sub.update()) | 명령 수신 루프 |
| 6 | FailureInjector::update() | FI_U_02 | L2 | 50 | cmd != INJECT_FAILURE | 고장 주입 명령 확인 |
| 7 | FailureInjector::update() | FI_U_03 | L2 | 61 | unit == SYSTEM_MOTOR | 모터 시스템 단위 확인 |
| 8 | FailureInjector::update() | FI_U_04 | L3 | 64 | type == FAILURE_TYPE_OK | 정상 복구 명령 |
| 9 | FailureInjector::update() | FI_U_05 | L4 | 69 | instance == 0 | 모든 모터 정상화 |
| 10 | FailureInjector::update() | FI_U_06 | L5 | 72 | i < CONNECTED_ESC_MAX | 정상화 루프 |
| 11 | FailureInjector::update() | FI_U_07 | L4 | 78 | instance in [1,MAX] | 개별 모터 정상화 |
| 12 | FailureInjector::update() | FI_U_08 | L3 | 87 | type == FAILURE_TYPE_OFF | 모터 차단 명령 |
| 13 | FailureInjector::update() | FI_U_09 | L4 | 92 | instance == 0 | 모든 모터 차단 |
| 14 | FailureInjector::update() | FI_U_10 | L5 | 93 | i < CONNECTED_ESC_MAX | 차단 루프 |
| 15 | FailureInjector::update() | FI_U_11 | L4 | 98 | instance in [1,MAX] | 개별 모터 차단 |
| 16 | FailureInjector::update() | FI_U_12 | L3 | 104 | type == FAILURE_TYPE_WRONG | 잘못된 동작 명령 |
| 17 | FailureInjector::update() | FI_U_13 | L4 | 109 | instance == 0 | 모든 모터 오동작 |
| 18 | FailureInjector::update() | FI_U_14 | L5 | 110 | i < CONNECTED_ESC_MAX | 오동작 루프 |
| 19 | FailureInjector::update() | FI_U_15 | L4 | 115 | instance in [1,MAX] | 개별 모터 오동작 |
| 20 | FailureInjector::update() | FI_U_16 | L2 | 122 | handled == true | ACK 응답 전송 |
| 21 | manipulateEscStatus() | FI_M_01 | L1 | 138 | blocked!=0 OR wrong!=0 | ESC 조작 활성화 |
| 22 | manipulateEscStatus() | FI_M_02 | L2 | 141 | i < status.esc_count | ESC 상태 조작 루프 |
| 23 | manipulateEscStatus() | FI_M_03 | L3 | 144 | blocked & (1<<i_esc) | ESC 차단 상태 |
| 24 | manipulateEscStatus() | FI_M_04 | L3 | 150 | wrong & (1<<i_esc) | ESC 오동작 상태 |
| 25 | FailureDetector::update() | FD_U_01 | L1 | 173 | attitude_control_enabled | 자세 제어 활성화 |
| 26 | FailureDetector::update() | FD_U_02 | L1 | 187 | esc_status_sub.update() | ESC 데이터 업데이트 |
| 27 | FailureDetector::update() | FD_U_03 | L2 | 190 | param_escs_en.get() | ESC 탐지 기능 활성화 |
| 28 | FailureDetector::update() | FD_U_04 | L2 | 194 | param_actuator_en.get() | 액추에이터 탐지 활성화 |
| 29 | FailureDetector::update() | FD_U_05 | L1 | 199 | imb_prop_thr > 0 | 불균형 프로펠러 탐지 활성화 |
| 30 | updateAttitudeStatus() | FD_A_01 | L1 | 210 | attitude_sub.update() | 자세 데이터 업데이트 |
| 31 | updateAttitudeStatus() | FD_A_02 | L2 | 217 | is_vtol_tailsitter | VTOL 테일시터 확인 |
| 32 | updateAttitudeStatus() | FD_A_03 | L3 | 218 | in_transition_mode | 전환 모드 확인 |
| 33 | updateAttitudeStatus() | FD_A_04 | L3 | 223 | type == FIXED_WING | 고정익 모드 확인 |
| 34 | updateEscsStatus() | FD_E_01 | L1 | 259 | arming_state == ARMED | 시동 상태 확인 |
| 35 | updateEscsStatus() | FD_E_02 | L2 | 266 | i < limited_esc_count | ESC 고장 확인 루프 |
| 36 | updateEscsStatus() | FD_E_03 | L3 | 267 | esc[i].failures > 0 | ESC 고장 카운터 확인 |
| 37 | updateImbalancedPropStatus() | FD_I_01 | L1 | 287 | sensor_selection.updated() | 센서 선택 업데이트 |
| 38 | updateImbalancedPropStatus() | FD_I_02 | L2 | 290 | copy_selection_success | 센서 선택 복사 성공 |
| 39 | updateImbalancedPropStatus() | FD_I_03 | L1 | 301 | accel_id != selected_id | 가속도계 ID 불일치 |
| 40 | updateImbalancedPropStatus() | FD_I_04 | L2 | 303 | i < ORB_MULTI_MAX_INSTANCES | IMU 인스턴스 루프 |
| 41 | updateImbalancedPropStatus() | FD_I_05 | L3 | 304 | !ChangeInstance(i) | IMU 인스턴스 변경 고장 |
| 42 | updateImbalancedPropStatus() | FD_I_06 | L3 | 308-309 | copy_success && id_match | IMU 복사 성공 및 ID 일치 |
| 43 | updateImbalancedPropStatus() | FD_I_07 | L1 | 316 | updated_flag | 업데이트 플래그 확인 |
| 44 | updateImbalancedPropStatus() | FD_I_08 | L2 | 318 | copy_final_imu_success | 최종 IMU 복사 성공 |
| 45 | updateImbalancedPropStatus() | FD_I_09 | L3 | 320-321 | valid_id && id_match | 유효 ID 및 일치 확인 |
| 47 | updateMotorStatus() | FD_M_01 | L1 | 357 | arming_state == ARMED | 시동 상태 확인 |
| 48 | updateMotorStatus() | FD_M_02 | L2 | 364 | esc_idx < limited_count | 모터 상태 루프 |
| 49 | updateMotorStatus() | FD_M_03 | L3 | 371 | i_esc >= NUM_CONTROLS | ESC 인덱스 범위 초과 |
| 50 | updateMotorStatus() | FD_M_04 | L3 | 376 | !valid_mask && current>0 | 유효 전류 마스크 설정 |
| 51 | updateMotorStatus() | FD_M_05 | L3 | 387 | valid && timeout && !flag | ESC 타임아웃 발생 |
| 52 | updateMotorStatus() | FD_M_06 | L3 | 391 | !timeout && flagged | ESC 타임아웃 해제 |
| 53 | updateMotorStatus() | FD_M_07 | L3 | 397 | current > FLT_EPSILON | ESC 전류 유효성 |
| 54 | updateMotorStatus() | FD_M_08 | L3 | 401 | has_current[i_esc] | 전류 보고 이력 확인 |
| 55 | updateMotorStatus() | FD_M_09 | L4 | 404 | ISFINITE(control[i]) | 제어 신호 유한성 |
| 56 | updateMotorStatus() | FD_M_10 | L4 | 412 | throttle && low && !timeout | 전류 부족 복합 조건 |
| 57 | updateMotorStatus() | FD_M_11 | L5 | 413 | start_time == 0 | 전류부족 시작시간 미설정 |
| 58 | updateMotorStatus() | FD_M_12 | L5 | 418 | start_time != 0 | 전류부족 시작시간 설정됨 |
| 59 | updateMotorStatus() | FD_M_13 | L4 | 423 | duration > threshold | 전류부족 지속시간 초과 |
| 60 | updateMotorStatus() | FD_M_14 | L2 | 435 | critical && !motor_flag | 치명적 고장 발생 |
| 61 | updateMotorStatus() | FD_M_15 | L2 | 439 | !critical && motor_flag | 치명적 고장 해제 |
| 62 | updateMotorStatus() | FD_M_16 | L2 | 446 | i_esc < NUM_CONTROLS | 시동해제 시 초기화 루프 |
:::

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
:::details 1. FailureInjector::update()
- **위치**: FailureDetector.cpp:45-133
- **분기 레벨**: 5단계 (중첩 if문 + for 루프)
- **커버리지 요구사항**: 16개 분기 만족

**분기 구조 분석:**
```
L1: while (_vehicle_command_sub.update(&vehicle_command)) {         // FI_U_01
L2:     if (vehicle_command.command != VEHICLE_CMD_INJECT_FAILURE) { // FI_U_02
            continue;
        }
L2:     if (failure_unit == FAILURE_UNIT_SYSTEM_MOTOR) {            // FI_U_03
L3:         if (failure_type == FAILURE_TYPE_OK) {                  // FI_U_04
L4:             if (instance == 0) {                                 // FI_U_05
L5:                 for (int i = 0; i < CONNECTED_ESC_MAX; i++) {    // FI_U_06
                        // 모든 모터 정상화
                    }
L4:             } else if (instance >= 1 && instance <= MAX) {       // FI_U_07
                    // 개별 모터 정상화
                }
L3:         } else if (failure_type == FAILURE_TYPE_OFF) {           // FI_U_08
L4:             if (instance == 0) {                                 // FI_U_09
L5:                 for (int i = 0; i < CONNECTED_ESC_MAX; i++) {    // FI_U_10
                        // 모든 모터 차단
                    }
L4:             } else if (instance >= 1 && instance <= MAX) {       // FI_U_11
                    // 개별 모터 차단
                }
L3:         } else if (failure_type == FAILURE_TYPE_WRONG) {         // FI_U_12
L4:             if (instance == 0) {                                 // FI_U_13
L5:                 for (int i = 0; i < CONNECTED_ESC_MAX; i++) {    // FI_U_14
                        // 모든 모터 오동작
                    }
L4:             } else if (instance >= 1 && instance <= MAX) {       // FI_U_15
                    // 개별 모터 오동작
                }
            }
        }
L2:     if (handled) {                                               // FI_U_16
            // ACK 응답 전송
        }
    }
```
:::

:::details 2. FailureInjector::manipulateEscStatus()
- **위치**: FailureDetector.cpp:136-160
- **분기 레벨**: 3단계
- **커버리지 요구사항**: 4개 분기 만족

**분기 구조 분석:**
```
L1: if (_esc_blocked != 0 || _esc_wrong != 0) {                     // FI_M_01
L2:     for (int i = 0; i < status.esc_count; i++) {                // FI_M_02
L3:         if (_esc_blocked & (1 << i_esc)) {                      // FI_M_03
                // ESC 차단: 상태 초기화 및 offline 처리
L3:         } else if (_esc_wrong & (1 << i_esc)) {                 // FI_M_04
                // ESC 오동작: voltage/current/rpm 조작
            }
        }
    }
```

:::

### 2.4 FailureDetector 함수

:::details 1. FailureDetector::update()
- **위치**: FailureDetector.cpp:167-204
- **분기 레벨**: 2단계
- **커버리지 요구사항**: 5개 분기 만족

**분기 구조 분석:**
```
    _failure_injector.update();

L1: if (vehicle_control_mode.flag_control_attitude_enabled) {        // FD_U_01
        updateAttitudeStatus(vehicle_status);
    } else {
        // 자세 관련 고장 플래그들을 false로 설정
    }

L1: if (_esc_status_sub.update(&esc_status)) {                       // FD_U_02
        _failure_injector.manipulateEscStatus(esc_status);

L2:     if (_param_escs_en.get()) {                                  // FD_U_03
            updateEscsStatus(vehicle_status, esc_status);
        }

L2:     if (_param_fd_actuator_en.get()) {                          // FD_U_04
            updateMotorStatus(vehicle_status, esc_status);
        }
    }

L1: if (_param_fd_imb_prop_thr.get() > 0) {                         // FD_U_05
        updateImbalancedPropStatus();
    }

    return _status.value != status_prev.value;  // 단순 계산/반환 - 분기 아님
```

:::

:::details 2. FailureDetector::updateAttitudeStatus() (수정됨)
- **위치**: FailureDetector.cpp:206-252
- **분기 레벨**: 3단계
- **총 분기**: 4개 (변수 계산용 조건문 제외)
- **커버리지 요구사항**: 4개 분기 만족

**분기 구조 분석:**
```
L1: if (_vehicle_attitude_sub.update(&attitude)) {                   // FD_A_01
        // 자세 데이터 처리
        const matrix::Eulerf euler(matrix::Quatf(attitude.q));
        float roll(euler.phi());
        float pitch(euler.theta());

L2:     if (vehicle_status.is_vtol_tailsitter) {                     // FD_A_02
L3:         if (vehicle_status.in_transition_mode) {                 // FD_A_03
                // 전환 모드에서 자세 검사 비활성화
                roll = 0.f; pitch = 0.f;
L3:         } else if (vehicle_status.vehicle_type == VEHICLE_TYPE_FIXED_WING) { // FD_A_04
                // 고정익 모드에서 90도 회전 보정
                // roll, pitch 값 재계산
            }
        }

        // 변수 계산 (분기가 아님)
        const float max_roll_deg = _param_fd_fail_r.get();
        const float max_pitch_deg = _param_fd_fail_p.get();
        const float max_roll(fabsf(math::radians(max_roll_deg)));
        const float max_pitch(fabsf(math::radians(max_pitch_deg)));

        // 상태 계산 및 히스테리시스 업데이트 (분기가 아님)
        const bool roll_status = (max_roll > FLT_EPSILON) && (fabsf(roll) > max_roll);
        const bool pitch_status = (max_pitch > FLT_EPSILON) && (fabsf(pitch) > max_pitch);

        _roll_failure_hysteresis.set_state_and_update(roll_status, time_now);
        _pitch_failure_hysteresis.set_state_and_update(pitch_status, time_now);
        _status.flags.roll = _roll_failure_hysteresis.get_state();
        _status.flags.pitch = _pitch_failure_hysteresis.get_state();
    }
```
:::

:::details 3. FailureDetector::updateEscsStatus() (수정됨)
- **위치**: FailureDetector.cpp:255-282
- **분기 레벨**: 3단계
- **총 분기**: 3개 (변수 계산 조건문 제외)
- **커버리지 요구사항**: 3개 분기 만족

**분기 구조 분석:**
```
L1: if (vehicle_status.arming_state == ARMING_STATE_ARMED) {         // FD_E_01
        // ESC 상태 분석 (변수 계산 - 분기 아님)
        const int limited_esc_count = math::min(esc_status.esc_count, esc_status_s::CONNECTED_ESC_MAX);
        const int all_escs_armed_mask = (1 << limited_esc_count) - 1;
        const bool is_all_escs_armed = (all_escs_armed_mask == esc_status.esc_armed_flags);

        bool is_esc_failure = !is_all_escs_armed;

L2:     for (int i = 0; i < limited_esc_count; i++) {                // FD_E_02
L3:         is_esc_failure = is_esc_failure || (esc_status.esc[i].failures > 0); // FD_E_03
        }

        _esc_failure_hysteresis.set_hysteresis_time_from(false, 300_ms);
        _esc_failure_hysteresis.set_state_and_update(is_esc_failure, time_now);

        // 히스테리시스 결과 적용 (분기가 아님)
        if (_esc_failure_hysteresis.get_state()) {
            _status.flags.arm_escs = true;
        }

    } else {
        // ESC 비트필드 리셋
        _esc_failure_hysteresis.set_state_and_update(false, time_now);
        _status.flags.arm_escs = false;
    }
```
:::

:::details 4. FailureDetector::updateImbalancedPropStatus() (수정됨)
- **위치**: FailureDetector.cpp:284-340
- **분기 레벨**: 4단계
- **총 분기**: 6개 (변수 계산 조건문 제외, for문 및 조건문 통합)
- **커버리지 요구사항**: 6개 분기 만족

**분기 구조 분석:**
```
L1: if (_sensor_selection_sub.updated()) {                           // FD_I_01
        sensor_selection_s selection;
L2:     if (_sensor_selection_sub.copy(&selection)) {               // FD_I_02
            _selected_accel_device_id = selection.accel_device_id;
        }
    }

    const bool updated = _vehicle_imu_status_sub.updated(); // 플래그 저장
    vehicle_imu_status_s imu_status{};
    _vehicle_imu_status_sub.copy(&imu_status);

L1: if (imu_status.accel_device_id != _selected_accel_device_id) {   // FD_I_03
L2:     for (unsigned i = 0; i < ORB_MULTI_MAX_INSTANCES; i++) {     // FD_I_04
L3:         if (!_vehicle_imu_status_sub.ChangeInstance(i)) {        // FD_I_05
                continue;
            }
            // FD_I_06: 통합된 조건문 (copy 성공 && ID 일치)
L3:         if (_vehicle_imu_status_sub.copy(&imu_status)            // FD_I_06
               && (imu_status.accel_device_id == _selected_accel_device_id)) {
                break;  // 인스턴스 발견
            }
        }
    }

L1: if (updated) {                                                  // FD_I_07
L2:     if (_vehicle_imu_status_sub.copy(&imu_status)) {             // FD_I_08
            // FD_I_09: 통합된 조건문 (유효 ID && ID 일치)
L3:         if ((imu_status.accel_device_id != 0)                    // FD_I_09
               && (imu_status.accel_device_id == _selected_accel_device_id)) {

                // 메트릭 계산 (변수 계산 - 분기 아님)
                const float dt = math::constrain(...);
                _imbalanced_prop_lpf.setParameters(dt, _imbalanced_prop_lpf_time_constant);

                const float std_x = sqrtf(math::max(imu_status.var_accel[0], 0.f));
                const float std_y = sqrtf(math::max(imu_status.var_accel[1], 0.f));
                const float std_z = sqrtf(math::max(imu_status.var_accel[2], 0.f));

                const float metric = (std_x + std_y) / 2.f - std_z;
                const float metric_lpf = _imbalanced_prop_lpf.update(metric);

                // 임계값 비교 및 상태 설정 (변수 계산 - 분기 아님)
                const bool is_imbalanced = metric_lpf > _param_fd_imb_prop_thr.get();
                _status.flags.imbalanced_prop = is_imbalanced;
            }
        }
    }
```
:::

:::details 5. FailureDetector::updateMotorStatus()
- **위치**: FailureDetector.cpp:342-453
- **분기 레벨**: 5단계 (가장 복잡)
- **커버리지 요구사항**: 16개 분기 만족

**분기 구조 분석:**
```
L1: if (vehicle_status.arming_state == ARMING_STATE_ARMED) {         // FD_M_01
L2:     for (int esc_status_idx = 0; esc_status_idx < limited_esc_count; esc_status_idx++) { // FD_M_02
L3:         if (i_esc >= actuator_motors_s::NUM_CONTROLS) {          // FD_M_03
                continue;
            }

L3:         if (!(_motor_failure_esc_valid_current_mask & (1 << i_esc)) &&
                cur_esc_report.esc_current > 0.0f) {                  // FD_M_04
                _motor_failure_esc_valid_current_mask |= (1 << i_esc);
            }

            // 타임아웃 검사
L3:         if (esc_was_valid && esc_timed_out && !esc_timeout_currently_flagged) { // FD_M_05
                _motor_failure_esc_timed_out_mask |= (1 << i_esc);
L3:         } else if (!esc_timed_out && esc_timeout_currently_flagged) {           // FD_M_06
                _motor_failure_esc_timed_out_mask &= ~(1 << i_esc);
            }

            // 전류 검사
L3:         if (cur_esc_report.esc_current > FLT_EPSILON) {          // FD_M_07
                _motor_failure_esc_has_current[i_esc] = true;
            }

L3:         if (_motor_failure_esc_has_current[i_esc]) {             // FD_M_08
L4:             if (PX4_ISFINITE(actuator_motors.control[i_esc])) {  // FD_M_09
                    esc_throttle = fabsf(actuator_motors.control[i_esc]);
                }

L4:             if (throttle_above_threshold && current_too_low && !esc_timed_out) { // FD_M_10
L5:                 if (_motor_failure_undercurrent_start_time[i_esc] == 0) {        // FD_M_11
                        _motor_failure_undercurrent_start_time[i_esc] = time_now;
                    }
                } else {
L5:                 if (_motor_failure_undercurrent_start_time[i_esc] != 0) {        // FD_M_12
                        _motor_failure_undercurrent_start_time[i_esc] = 0;
                    }
                }

L4:             if (_motor_failure_undercurrent_start_time[i_esc] != 0 &&
                    (time_now - _motor_failure_undercurrent_start_time[i_esc]) > threshold &&
                    (_motor_failure_esc_under_current_mask & (1 << i_esc)) == 0) {  // FD_M_13
                    _motor_failure_esc_under_current_mask |= (1 << i_esc);
                }
            }
        }

        // 치명적 고장 판단
L2:     if (critical_esc_failure && !(_status.flags.motor)) {        // FD_M_14
            _status.flags.motor = true;
L2:     } else if (!critical_esc_failure && _status.flags.motor) {   // FD_M_15
            _status.flags.motor = false;
        }

    } else { // Disarmed
L2:     for (int i_esc = 0; i_esc < actuator_motors_s::NUM_CONTROLS; i_esc++) { // FD_M_16
            _motor_failure_undercurrent_start_time[i_esc] = 0;
        }
        _motor_failure_esc_under_current_mask = 0;
        _status.flags.motor = false;
    }
```
:::

## 3. 함수 호출 관계

### 3.1 메인 호출 체인
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

### 3.2 독립적 수행 함수
- **FailureDetector::update()**: Commander 모듈에서의 호출, 고장 탐지 기능 수행.
- **상태 조회 함수들**: Commander에서 고장 탐지 기능의 결과를 확인하기 위해 호출.

### 3.3 주요 시나리오 분류
1. **Attitude Failure 시나리오**: 자세 고장 탐지
2. **ESC Failure 시나리오**: ESC 고장 탐지  
3. **Motor Failure 시나리오**: 모터 고장 탐지
4. **Vehicle Control Mode 시나리오**: 제어 모드 변경에 따른 탐지 활성화/비활성화
5. **Failure Injection 시나리오**: 테스트용 고장 주입

:::tip 상태 조회 함수들(getStatus, getStatusFlags, getImbalancedPropMetric, getMotorFailures)은 Commander에서 자동으로 호출되며 분기가 없어 100% 커버리지를 달성하므로 별도의 테스트 케이스가 필요하지 않음.
:::
## 4. 시나리오(Test Case) 수립 및 분기 커버 분류

### 4.1 COVER (시뮬레이션 가능) 시나리오
:::details TC-01 : Attitude Failure Detection
- **목적**: Roll/Pitch 각도 초과 시 고장 탐지
- **커버 분기**: FD_U_01, FD_A_01~08
- **입력 데이터**:
    (uORB) vehicle_attitude, (Param) FD_FAIL_R, FD_FAIL_P, FD_FAIL_R_TTRI, FD_FAIL_P_TTRI
- **외부 제어**: 비행 모드 설정(MAVLink), 자세 명령(조이스틱)

::: info **상세 시험절차**

**1. 시험 준비 단계**
- SITL 환경 구성: `make px4_sitl gz_x500` (기본 멀티콥터 모델, 예시)
- 파라미터 설정: `param set FD_FAIL_R 45`, `param set FD_FAIL_P 45` (고장 임계각 45도)
- 히스테리시스 파라미터: `param set FD_FAIL_R_TTRI 3`, `param set FD_FAIL_P_TTRI 3` (3초 지연)
- 모니터링 설정: `listener failure_detector_status`, GCS StatusTextMsg
- GCS에서 MAVLink 연결로 자세 제어 활성화 비행 모드 인가

**2. 시험 수행 단계**
- **자세 제어 활성화 테스트** (분기 FD_U_01)
  - GCS에서 Manual 비행 모드로 설정하여 flag_control_attitude_enabled = false
  - GCS에서 Stabilized 비행 모드로 설정하여 flag_control_attitude_enabled = true
  - updateAttitudeStatus() 함수 호출 확인
- **정상 자세 테스트** (분기 FD_A_01, FD_A_05~06 False 경로)
  - 정상 자세(±10도 이내)에서 고장 탐지가 발생하지 않는지 확인
- **롤/피치 각도 초과 테스트** (분기 FD_A_05~06 True 경로)
  - 조이스틱 조작을 통한 롤/피치 각도 50도 이상 명령 전송
  - 히스테리시스 시간(3초) 경과 후 고장 플래그 설정 확인
- **(코드 삭제?)VTOL 테일시터 특수 케이스** (분기 FD_A_02~04)
  - 테일시터 기체 타입 설정으로 90도 회전 보정 확인

**3. 시험 자료**
- **자세 데이터**: vehicle_attitude topic
- **제어 입력**: MAVLink SET_ATTITUDE_TARGET 메시지
- **기체 타입**: vehicle_status의 is_vtol_tailsitter, vehicle_type 설정
**시험 초기자료**
- - **파라미터 조작**: FD_FAIL_R/P, FD_FAIL_R/P_TTRI 값 변경(초기 설정 입력 데이터)

**시험 입력자료 사용방법:**
- **QGroundControl 파라미터 페이지**: `FD_FAIL_R`, `FD_FAIL_P`, `FD_FAIL_R_TTRI`, `FD_FAIL_P_TTRI` 값 설정
- **QGroundControl 가상 조이스틱**: Vehicle Setup > Joystick 에서 가상 조이스틱 활성화
- **과도한 자세 생성**: QGC 조이스틱으로 롤/피치 스틱을 최대치(±1.0)로 조작
- **MAVLink Console**: `commander mode stabilized` 명령으로 자세 제어 활성화
- **실시간 모니터링**: QGC의 Analyze Tools > MAVLink Inspector에서 vehicle_attitude 값 확인

**4. 시험 완료 후 확인 항목**
- **고장 플래그 확인**: failure_detector_status.fd_roll, fd_pitch 비트 설정
- **히스테리시스 동작**: 임계값 초과 후 설정된 지연시간만큼 대기 후 플래그 설정
- **상태 조회 검증**: getStatus(), getStatusFlags()로 실시간 상태 조회 확인
- **로그 분석**: 자세 데이터와 고장 탐지 타이밍 상관관계 분석
:::

:::details TC-02 : ESC Armed Status Failure
- **목적**: ESC 시동 고장 탐지
- **시뮬레이션 방법**: ESC 일부를 의도적으로 시동 해제
- **커버 분기**: FD_U_02~03, FD_E_01~04
- **입력 데이터**: esc_status topic
- **외부 제어**: ESC 설정 변경

::: info **상세 시험절차**

**1. 시험 준비 단계**
- SITL 환경 구성: DShot ESC 지원 모델 로드 `make px4_sitl gazebo_typhoon_h480`
- 파라미터 설정: `param set FD_ESCS_EN 1` (ESC 탐지 기능 활성화)
- ESC 텔레메트리 활성화: `param set DSHOT_CONFIG 600` (DShot600)
- uORB 모니터링 준비: `listener esc_status`, `listener failure_detector_status`

**2. 시험 수행 단계**
- **정상 ESC 시동 테스트** (FD_E_01~02, FD_E_03 False 경로)
  - 기체를 ARMED 상태로 변경하여 모든 ESC 시동 확인
  - esc_online_flags와 esc_armed_flags 비트마스크 일치성 검증
- **ESC 시동 고장 시뮬레이션** (FD_E_02 True 경로)
  - 시뮬레이션 코드에서 특정 ESC의 esc_armed_flags 비트 강제 제거
  - 300ms 히스테리시스 타이머 대기
- **ESC 고장 카운터 테스트** (FD_E_03 True 경로)
  - ESC 상태의 failures 필드를 인위적으로 증가 (예: overvoltage 시뮬레이션)

**3. 시험 입력**
- **데이터 소스**: esc_status topic (esc_armed_flags, esc_online_flags, failures)
- **상태 제어**: Commander 모듈의 시동/해제 명령
- **파라미터 조작**: FD_ESCS_EN (ESC 탐지 활성화/비활성화)
- **시뮬레이션 조작**: Gazebo ESC 플러그인 또는 SITL 코드 수정

**GCS 기반 입력/변조 방법:**
- **QGroundControl 파라미터 페이지**: `FD_ESCS_EN`을 1로 설정하여 ESC 고장 탐지 활성화
- **QGC Armed/Disarmed 버튼**: Fly View에서 Armed/Disarmed 토글로 시동 상태 제어
- **MAVLink Console**: `param set FD_ESCS_EN 1` 명령으로 기능 활성화
- **SITL 코드 수정**: `src/modules/simulation/simulator_mavlink.cpp`에서 ESC 상태 강제 변조
- **실시간 모니터링**: QGC MAVLink Inspector에서 esc_status.esc_armed_flags 비트마스크 확인

**4. 시험 완료 후 확인 항목**
- **고장 플래그 확인**: `failure_detector_status.fd_arm_escs` 값 확인
- **히스테리시스 동작**: 300ms 지연 후에만 고장 플래그 설정되는지 확인
- **시동 해제 시 초기화**: DISARMED 상태에서 모든 ESC 고장 플래그 해제 확인
- **로그 분석**: ESC 상태 변화와 고장 탐지 타이밍 상관관계 분석
:::

:::details TC-03 : Motor Telemetry Timeout
- **목적**: 모터 텔레메트리 타임아웃 탐지
- **시뮬레이션 방법**: ESC 텔레메트리 스트림 중단
- **커버 분기**: FD_U_04, FD_M_01~07, FD_M_17~18
- **입력 데이터**: esc_status timestamp 조작
- **외부 제어**: ESC 통신 차단

::: info **상세 시험절차**

**1. 시험 준비 단계**
- SITL 환경 구성: DShot 지원 모델 `make px4_sitl gazebo_iris_dshot`
- 파라미터 설정: `param set FD_ACT_EN 1`, `param set FD_ACT_MOT_TOUT 500`
- ESC 텔레메트리 활성화: `param set DSHOT_CONFIG 600`
- 모니터링 설정: `listener esc_status`, `listener actuator_motors`

**2. 시험 수행 단계**
- **정상 텔레메트리 확인** (FD_M_01~04)
  - 기체 시동 후 호버링 상태로 진입하여 ESC 전류 데이터 수신 확인
  - 각 ESC의 esc_current > 0.0f 조건으로 유효 전류 마스크 설정 확인
- **텔레메트리 타임아웃 시뮬레이션** (FD_M_05~06)
  - 특정 ESC(예: 모터1)의 텔레메트리 스트림을 인위적으로 차단
  - 300ms 대기 후 타임아웃 조건 만족 및 플래그 설정 확인
- **타임아웃 복구 테스트** (FD_M_07)
  - ESC 텔레메트리 복구 후 타임아웃 플래그 해제 확인

**3. 시험 입력**
- **데이터 소스**: esc_status topic (timestamp, esc_current, actuator_function)
- **상태 제어**: 시동/해제 명령, 스로틀 입력
- **파라미터 조작**: FD_ACT_EN, FD_ACT_MOT_TOUT
- **시뮬레이션 조작**: ESC 텔레메트리 스트림 차단/복구

**GCS 기반 입력/변조 방법:**
- **QGroundControl 파라미터 페이지**: `FD_ACT_EN`을 1로, `FD_ACT_MOT_TOUT`을 500ms로 설정
- **QGC Analyze Tools**: Vehicle Setup > Parameters에서 실시간으로 ESC 텔레메트리 상태 모니터링
- **SITL ESC 시뮬레이션 조작**: `src/modules/simulation/simulator_mavlink.cpp`에서 특정 ESC의 timestamp 업데이트 중단
- **MAVLink Console**: `param set FD_ACT_MOT_TOUT 300` 명령으로 타임아웃 임계값 조정
- **실시간 모니터링**: QGC MAVLink Inspector에서 `esc_status.esc[i].timestamp` 값 추적하여 타임아웃 확인

**4. 시험 완료 후 확인 항목**
- **타임아웃 플래그 확인**: `_motor_failure_esc_timed_out_mask` 비트 설정 확인
- **치명적 고장 탐지**: `failure_detector_status.fd_motor` 플래그 확인
- **복구 동작**: 텔레메트리 복구 시 플래그 해제 및 정상 동작 확인
- **로그 분석**: 타임아웃 발생 시점과 실제 ESC 데이터 중단 시점 일치성 확인
:::

:::details TC-04 : Vehicle Control Mode Change
- **목적**: 제어 모드 변경에 따른 탐지 활성화/비활성화
- **시뮬레이션 방법**: Manual/Auto 모드 전환
- **커버 분기**: FD_U_01, FD_U_06
- **입력 데이터**: vehicle_control_mode topic
- **외부 제어**: 모드 스위치 조작

::: info **상세 시험절차**

**1. 시험 준비 단계**
- SITL 환경 구성: `make px4_sitl gazebo_iris`
- RC 컨트롤러 연결 또는 가상 RC 설정
- 모니터링 설정: `listener vehicle_control_mode`, `listener failure_detector_status`
- 기본 파라미터 설정: 고장 탐지 기능들 활성화

**2. 시험 수행 단계**
- **Manual 모드 테스트** (FD_U_01 False 경로)
  - RC 스위치로 Manual 모드 진입 (자세 제어 비활성화)
  - flag_control_attitude_enabled = false 상태 확인
  - 자세 관련 고장 플래그들이 강제로 false로 설정되는지 확인
- **Stabilized/Position 모드 테스트** (FD_U_01 True 경로)
  - RC 스위치로 Stabilized 또는 Position 모드 진입
  - flag_control_attitude_enabled = true 상태 확인
  - updateAttitudeStatus() 함수 호출 여부 확인
- **모드 전환 반복 테스트** (FD_U_06)
  - Manual ↔ Stabilized 모드 반복 전환하여 상태 변경 탐지 확인

**3. 시험 입력**
- **데이터 소스**: vehicle_control_mode topic (flag_control_attitude_enabled)
- **제어 입력**: RC 모드 스위치 또는 QGroundControl 모드 변경
- **파라미터 조작**: 각종 고장 탐지 기능 활성화 파라미터들
- **상태 변경**: 다양한 비행 모드 간 전환

**GCS 기반 입력/변조 방법:**
- **QGroundControl Fly View**: 화면 상단의 비행 모드 드롭다운에서 Manual/Stabilized/Position 모드 전환
- **QGC 가상 RC**: Vehicle Setup > Radio에서 가상 RC 설정 후 모드 스위치 조작
- **MAVLink Console**: `commander mode manual`, `commander mode stabilized` 명령으로 직접 모드 변경
- **실시간 모니터링**: QGC MAVLink Inspector에서 `vehicle_control_mode.flag_control_attitude_enabled` 상태 확인
- **RC 모드 스위치**: QGC에 연결된 RC 컨트롤러의 모드 스위치로 실제 모드 전환 테스트

**4. 시험 완료 후 확인 항목**
- **모드별 기능 분화**: Manual 모드에서 자세 탐지만 비활성화, ESC/모터 탐지는 유지
- **상태 변경 반환값**: update() 함수가 상태 변경 시 true, 미변경 시 false 반환 확인
- **실시간 응답성**: 모드 전환 즉시 고장 탐지 기능 활성화/비활성화 확인
- **로그 분석**: 모드 전환 시점과 고장 탐지 상태 변화 상관관계 분석
:::

:::details TC-05 : Failure Injection via MAVLink
- **목적**: MAVLink를 통한 고장 주입 테스트
- **시뮬레이션 방법**: VEHICLE_CMD_INJECT_FAILURE 명령 전송
- **커버 분기**: FI_U_01~12, FI_M_01~04
- **입력 데이터**: vehicle_command topic
- **외부 제어**: MAVLink 명령 전송

::: info **상세 시험절차**

**1. 시험 준비 단계**
- SITL 환경 구성: `make px4_sitl gazebo_iris_dshot` (DShot ESC 지원)
- 모니터링 설정: `listener vehicle_command`, `listener vehicle_command_ack`
- ESC 상태 모니터링: `listener esc_status`
- 고장 탐지 상태 모니터링: `listener failure_detector_status`
- FailureInjector 내부 비트마스크 상태 로그 활성화

**2. 시험 수행 단계**
- **비고장주입 명령 필터링** (분기 FI_U_01~02)
  - 다른 MAVLink 명령(예: VEHICLE_CMD_ARM_DISARM) 전송하여 continue 동작 확인
  - VEHICLE_CMD_INJECT_FAILURE가 아닌 명령은 무시되는지 확인
- **모터 시스템 고장 주입 테스트** (분기 FI_U_03)
  - param1 = FAILURE_UNIT_SYSTEM_MOTOR로 설정하여 모터 고장 주입 모드 진입
  - 다른 failure_unit 값(예: 센서 고장)으로는 handled = false 확인
- **고장 타입별 명령 테스트** (분기 FI_U_04~16)
  - FAILURE_TYPE_OK: 정상 복구 명령 (분기 FI_U_04~07)
  - FAILURE_TYPE_OFF: 모터 차단 명령 (분기 FI_U_08~11)
  - FAILURE_TYPE_WRONG: 모터 오동작 명령 (분기 FI_U_12~15)
- **ESC 상태 조작 확인** (분기 FI_M_01~04)
  - manipulateEscStatus() 함수 호출로 ESC 상태 실시간 변조

**3. 시험 입력**
- **MAVLink 명령**: QGroundControl Console 또는 pymavlink 스크립트
- **param1**: FAILURE_UNIT_SYSTEM_MOTOR (모터 시스템 지정)
- **param2**: FAILURE_TYPE_OK/OFF/WRONG (고장 유형)
- **param3**: 0(전체) 또는 1~8(개별 모터 인덱스)
- **ESC 데이터**: 실시간 ESC 텔레메트리 수신 상태

**GCS 기반 입력/변조 방법:**
- **QGroundControl MAVLink Console**: Analyze Tools > MAVLink Console에서 직접 명령 입력
  - 모든 모터 차단: `command long 420 0 1.0 1.0 0.0 0.0 0.0 0.0 0.0` (INJECT_FAILURE)
  - 모터1 차단: `command long 420 0 1.0 1.0 1.0 0.0 0.0 0.0 0.0`
  - 모터1 정상화: `command long 420 0 1.0 0.0 1.0 0.0 0.0 0.0 0.0`
- **pymavlink 스크립트**: 외부 Python 스크립트로 정밀한 명령 시퀀스 생성
- **QGC Analyze Tools**: MAVLink Inspector에서 `vehicle_command` 및 `vehicle_command_ack` 메시지 실시간 모니터링
- **ESC 상태 확인**: MAVLink Inspector에서 `esc_status` topic의 전압/전류/RPM 값 변화 추적
- **실시간 로그**: QGC Log Download에서 고장 주입 전후의 시스템 로그 분석

**4. 시험 완료 후 확인 항목**
- **ACK 응답 확인**: VEHICLE_CMD_RESULT_ACCEPTED/UNSUPPORTED 응답 수신
- **비트마스크 상태**: _esc_blocked, _esc_wrong 내부 변수 상태 로그 확인
- **ESC 상태 조작**: voltage/current/rpm 값 변조 및 offline 플래그 설정 확인
- **실시간 반영**: ESC 상태 변조가 즉시 esc_status topic에 반영되는지 확인
- **복구 동작**: FAILURE_TYPE_OK 명령으로 정상 상태 복구 확인
:::


### 4.2 STATIC (탐침코드 필요) 분기
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

### 4.3 분기 커버리지 요약

| 함수명 | 분기 ID 범위 | 총 분기 | COVER | STATIC | 커버리지(%) |
|--------|-------------|---------|-------|--------|-------------|
| getStatus() | - | 1 | 1 | 0 | 100% |
| getStatusFlags() | - | 1 | 1 | 0 | 100% |
| getImbalancedPropMetric() | - | 1 | 1 | 0 | 100% |
| getMotorFailures() | - | 1 | 1 | 0 | 100% |
| FailureInjector::update() | FI_U_01~16 | 16 | 16 | 0 | 100% |
| manipulateEscStatus() | FI_M_01~04 | 4 | 4 | 0 | 100% |
| FailureDetector::update() | FD_U_01~05 | 5 | 5 | 0 | 100% |
| updateAttitudeStatus() | FD_A_01~04 | 4 | 4 | 0 | 100% |
| updateEscsStatus() | FD_E_01~03 | 3 | 3 | 0 | 100% |
| updateImbalancedPropStatus() | FD_I_01~09 | 9 | 6 | 3 | 67% |
| updateMotorStatus() | FD_M_01~16 | 16 | 14 | 2 | 88% |
| **전체** | **62개 분기** | **62** | **57** | **5** | **92%** |

## 5. 시험 환경 및 데이터 출처

### 5.1 하드웨어/소프트웨어 구성도
- **체계통합 시험 환경**: FMS HILS 환경 상에서 타겟 보드(전체 펌웨어 업로드) 운용.
- **SITL (Software In The Loop)**: Gazebo 시뮬레이션 환경
- **HITL (Hardware In The Loop)**: 실제 하드웨어와 시뮬레이션 조합

### 5.2 입력 데이터 출처
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

### 5.3 외부 조작 방법
- **MAVLink 명령**: GCS 또는 MAVSDK
- **Parameter 변경**: PX4 콘솔 또는 GCS

### 5.4 출력 데이터
- **vehicle_command_ack**: uORB 비행체 명령 확인

## 6. 권장사항
1. **Dynamic Testing**: COVER 분기들에 대해 운용 시나리오 기반 테스트 우선 수행
2. **Static Analysis**: STATIC 분기들에 대해 탐침코드를 통한 직접 검증 필요
3. **Coverage Tools**: gcov/lcov를 활용한 실제 코드 커버리지 측정 병행
