import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { MdChevronLeft, MdChevronRight } from "react-icons/md";
import Button from "@/components/common/button/Button";
import Input from "@/components/common/input/Input";
import { getTodayDate, isRoutineDate, isRoutineScheduled, moveRoutineDate } from "@/features/routine/routineSchedule";
import Header from "@/components/common/header/Header";
import { getRoutines } from "@/features/routine/routineStorage";
import styles from "./RoutinePage.module.scss";

function loadRoutines() {
  try {
    return { routines: getRoutines(), error: "" };
  } catch {
    return {
      routines: [],
      error:
        "루틴 목록을 불러오지 못했어요. 저장된 데이터와 브라우저 저장 설정을 확인해 주세요.",
    };
  }
}

function RoutinePage() {
  const [{ routines, error }] = useState(loadRoutines);
  const [searchParams, setSearchParams] = useSearchParams();
  const today = getTodayDate();
  const dateParam = searchParams.get("date") ?? "";
  const selectedDate = isRoutineDate(dateParam) ? dateParam : today;
  const isAllView = searchParams.get("view") === "all";
  const visibleRoutines = isAllView ? routines : routines.filter(routine => isRoutineScheduled(routine.schedule, selectedDate));
  const weekday = new Intl.DateTimeFormat("ko-KR", { weekday: "long", timeZone: "UTC" })
    .format(new Date(`${selectedDate}T00:00:00Z`));

  function handleDateChange(date: string) {
    if (!isRoutineDate(date)) return;
    const next = new URLSearchParams(searchParams);
    next.set("date", date);
    setSearchParams(next, { replace: true });
  }

  function handleViewChange(isAll: boolean) {
    const next = new URLSearchParams(searchParams);
    next.set("date", selectedDate);
    if (isAll) next.set("view", "all");
    else next.delete("view");
    setSearchParams(next, { replace: true });
  }
  return (
    <section className={styles["routine-page"]}>
      <Header
        title="루틴"
        showBack={false}
        actions={
          <Link className={styles["add-link"]} to="/routine/new">
            루틴 생성
          </Link>
        }
      />
      <div className={styles["content"]}>
        <div className={styles["view-options"]} role="group" aria-label="루틴 보기">
          <Button color={isAllView ? "gray" : "mint"} fill={isAllView ? "outline" : "solid"}
            aria-pressed={!isAllView} onClick={() => handleViewChange(false)}>날짜별 루틴</Button>
          <Button color={isAllView ? "mint" : "gray"} fill={isAllView ? "solid" : "outline"}
            aria-pressed={isAllView} onClick={() => handleViewChange(true)}>전체 루틴</Button>
        </div>
        {!isAllView && <div className={styles["date-picker"]}>
          <label htmlFor="routine-date">날짜 선택</label>
          <div className={styles["date-row"]}>
            <Button color="gray" fill="outline" aria-label="이전 날"
              disabled={selectedDate === "0001-01-01"} onClick={() => handleDateChange(moveRoutineDate(selectedDate, -1))}>
              <MdChevronLeft size={24} aria-hidden="true" />
            </Button>
            <Input id="routine-date" type="date" min="0001-01-01" max="9999-12-31"
              value={selectedDate} onChange={event => handleDateChange(event.target.value)} />
            <Button color="gray" fill="outline" aria-label="다음 날"
              disabled={selectedDate === "9999-12-31"} onClick={() => handleDateChange(moveRoutineDate(selectedDate, 1))}>
              <MdChevronRight size={24} aria-hidden="true" />
            </Button>
          </div>
          <div className={styles["date-caption"]}>
            <p>{weekday}</p>
            <Button color="gray" fill="outline" disabled={selectedDate === today} onClick={() => handleDateChange(today)}>오늘</Button>
          </div>
        </div>}
        <h2 className={styles["list-heading"]}>{isAllView ? "전체 루틴" : "예정된 루틴"}</h2>
        {error && (
          <p role="alert" className={styles["error"]}>
            {error}
          </p>
        )}
        {!error && routines.length === 0 && (
          <p className={styles["message"]}>아직 등록한 루틴이 없어요.</p>
        )}
        {!error && routines.length > 0 && visibleRoutines.length === 0 && (
          <p className={styles["message"]}>이 날짜에 예정된 루틴이 없어요.</p>
        )}
        {!error && visibleRoutines.length > 0 && (
          <ul className={styles["list"]}>
            {visibleRoutines.map((routine) => (
              <li key={routine.id}>
                <Link
                  className={styles["detail-link"]}
                  to={`/routine/${encodeURIComponent(routine.id)}`}
                >
                  <h2>{routine.name}</h2>
                  <p>운동 {routine.exerciseIds.length}개</p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

export default RoutinePage;
