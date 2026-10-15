import { BrowserRouter, Link, Navigate, Route, Routes } from "react-router-dom";

import ToastContainer from "@/components/common/toast/ToastContainer";
import BottomNavigation from "./BottomNavigation";

import RoutinePage from "@/pages/routine/RoutinePage";
import RoutineDetailPage from "@/pages/routine/RoutineDetailPage";
import RoutineEditPage from "@/pages/routine/RoutineEditPage";
import RoutineCreatePage from "@/pages/routine/RoutineCreatePage";
import ExerciseListPage from "@/pages/exercise/ExerciseListPage";
import ExerciseDetailPage from "@/pages/exercise/ExerciseDetailPage";
import ExerciseEditPage from "@/pages/exercise/ExerciseEditPage";
import ExerciseCreatePage from "@/pages/exercise/ExerciseCreatePage";

import styles from "./App.module.scss";

function App() {
  return (
    <BrowserRouter>
      <main className={styles["app-shell"]}>
        <Routes>
          <Route path="/" element={<Navigate to="/exercise" replace />} />

          <Route element={<BottomNavigation />}>
            <Route path="/routine" element={<RoutinePage />} />
            <Route path="/exercise" element={<ExerciseListPage />} />
          </Route>

          <Route path="/routine/:routineId" element={<RoutineDetailPage />} />
          <Route
            path="/routine/:routineId/edit"
            element={<RoutineEditPage />}
          />
          <Route path="/routine/new" element={<RoutineCreatePage />} />

          <Route
            path="/exercise/:exerciseId"
            element={<ExerciseDetailPage />}
          />
          <Route
            path="/exercise/:exerciseId/edit"
            element={<ExerciseEditPage />}
          />
          <Route path="/exercise/new" element={<ExerciseCreatePage />} />

          <Route
            path="*"
            element={
              <div className={styles["home"]}>
                <h1>페이지를 찾을 수 없어요.</h1>
                <Link to="/">메인으로</Link>
              </div>
            }
          />
        </Routes>
      </main>
      <ToastContainer />
    </BrowserRouter>
  );
}

export default App;
