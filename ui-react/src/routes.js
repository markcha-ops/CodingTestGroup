/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/** 
  All of the routes for the Material Dashboard 2 React are added here,
  You can add a new route, customize the routes and delete the routes here.

  Once you add a new route on this file it will be visible automatically on
  the Sidenav.

  For adding a new route you can follow the existing routes in the routes array.
  1. The `type` key with the `collapse` value is used for a route.
  2. The `type` key with the `title` value is used for a title inside the Sidenav. 
  3. The `type` key with the `divider` value is used for a divider between Sidenav items.
  4. The `name` key is used for the name of the route on the Sidenav.
  5. The `key` key is used for the key of the route (It will help you with the key prop inside a loop).
  6. The `icon` key is used for the icon of the route on the Sidenav, you have to add a node.
  7. The `collapse` key is used for making a collapsible item on the Sidenav that has other routes
  inside (nested routes), you need to pass the nested routes inside an array as a value for the `collapse` key.
  8. The `route` key is used to store the route location which is used for the react router.
  9. The `href` key is used to store the external links location.
  10. The `title` key is only for the item with the type of `title` and its used for the title text on the Sidenav.
  10. The `component` key is used to store the component of its route.
*/

// Material Dashboard 2 React layouts
import Dashboard from "layouts/dashboard";
import Tables from "layouts/tables";
import DevTool from "layouts/devtool";
import Billing from "layouts/billing";
import Course from "layouts/course";
import Lecture from "layouts/lecture"
import LectureDetail from "layouts/lecture/detail"
import LectureAdmin from "layouts/lecture/admin"
import AdminLectureDetail from "layouts/lecture/admin-detail"
import Notifications from "layouts/notifications";
import Profile from "layouts/profile";
import SignIn from "layouts/authentication/sign-in";
import SignUp from "layouts/authentication/sign-up";
import Question from "layouts/question";
import CodingPage from "layouts/coding";
import QuestionList from "layouts/question-list";
import QuestionProblems from "layouts/question-problems";
import CourseStudents from "layouts/course-students";
import LectureList from "layouts/lecture-list";

// @mui icons
import Icon from "@mui/material/Icon";
import TokenHandler from "./TokenHandler";
import CourseManage from "./layouts/course-manage";


const routes = [
  // Dashboard and general items
  {
    type: "collapse",
    name: "Dashboard",
    key: "dashboard",
    icon: <Icon fontSize="small">dashboard</Icon>,
    route: "/dashboard",
    component: <Dashboard />,
    hide: true,
  },
  {
    type: "collapse",
    name: "강의",
    key: "lecture",
    icon: <Icon fontSize="small">school</Icon>,
    route: "/lecture",
    component: <Lecture />,
    hide: false,
  },
  {
    type: "collapse",
    name: "강의 목록",
    key: "lecture-list",
    icon: <Icon fontSize="small">list_alt</Icon>,
    route: "/lecture-list",
    component: <LectureList />,
    hide: false,
  },
  {
    type: "collapse",
    name: "코딩 문제",
    key: "question-problems",
    icon: <Icon fontSize="small">quiz</Icon>,
    route: "/question-problems",
    component: <QuestionProblems />,
    hide: false,
  },
  {
    type: "collapse",
    name: "강좌",
    key: "course",
    icon: <Icon fontSize="small">book</Icon>,
    route: "/course",
    component: <Course />,
    hide: true,
  },
  {
    type: "collapse",
    name: "코딩",
    key: "devtool",
    icon: <Icon fontSize="small">code</Icon>,
    route: "/devtool",
    component: <DevTool />,
    hide: false,
  },
  
  // Divider
  {
    type: "divider",
    key: "divider-1",
    hide: false,
    isAdminRoute: true
  },
  
  // Admin section title
  {
    type: "title",
    title: "관리",
    key: "admin-section",
    hide: false,
    isAdminRoute: true
  },
  
  // Admin items
  {
    type: "collapse",
    name: "코딩 문제",
    key: "question-list",
    icon: <Icon fontSize="small">list</Icon>,
    route: "/question-list",
    component: <QuestionList />,
    hide: false,
    isAdminRoute: true
  },
  {
    type: "collapse",
    name: "학생 관리",
    key: "student-management",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/student-management",
    component: <CourseStudents />,
    hide: false,
    isAdminRoute: true
  },
  {
    type: "collapse",
    name: "강좌 관리",
    key: "course-manage",
    icon: <Icon fontSize="small">settings</Icon>,
    route: "/course-manage",
    component: <CourseManage />,
    hide: true,
    isAdminRoute: true
  },
  {
    type: "collapse",
    name: "강의 관리",
    key: "lecture-admin",
    icon: <Icon fontSize="small">admin_panel_settings</Icon>,
    route: "/lecture/admin",
    component: <LectureAdmin />,
    hide: false,
    isAdminRoute: true
  },
  
  // Hidden routes (keep these as they are)
  {
    type: "collapse",
    name: "강의 상세",
    key: "lecture-detail",
    icon: <Icon fontSize="small">menu_book</Icon>,
    route: "/lecture/detail",
    component: <LectureDetail />,
    hide: true,
  },
  {
    type: "collapse",
    name: "강의 상세 관리",
    key: "lecture-admin-detail",
    icon: <Icon fontSize="small">edit</Icon>,
    route: "/lecture/admin-detail",
    component: <AdminLectureDetail />,
    hide: true,
  },
  {
    type: "collapse",
    name: "코스 학생 관리",
    key: "course-students",
    icon: <Icon fontSize="small">people</Icon>,
    route: "/course-students",
    component: <CourseStudents />,
    hide: true,
  },
  {
    type: "collapse",
    name: "코딩 문제",
    key: "question",
    icon: <Icon fontSize="small">code</Icon>,
    route: "/question",
    component: <Question />,
    hide: true,
  },
  {
    type: "collapse",
    name: "코딩 페이지",
    key: "coding",
    icon: <Icon fontSize="small">code</Icon>,
    route: "/coding",
    component: <CodingPage />,
    hide: true,
  },
  {
    type: "collapse",
    name: "Tables",
    key: "tables",
    icon: <Icon fontSize="small">table_view</Icon>,
    route: "/tables",
    component: <Tables />,
    hide: true,
  },
  {
    type: "collapse",
    name: "Billing",
    key: "billing",
    icon: <Icon fontSize="small">receipt_long</Icon>,
    route: "/billing",
    component: <Billing />,
    hide: true,
  },
  {
    type: "collapse",
    name: "Notifications",
    key: "notifications",
    icon: <Icon fontSize="small">notifications</Icon>,
    route: "/notifications",
    component: <Notifications />,
    hide: true,
  },
  {
    type: "collapse",
    name: "Profile",
    key: "profile",
    icon: <Icon fontSize="small">person</Icon>,
    route: "/profile",
    component: <Profile />,
    hide: true,
  },
  {
    type: "collapse",
    name: "Sign In",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
    hide: true,
  },
  {
    type: "collapse",
    name: "Sign Up",
    key: "sign-up",
    icon: <Icon fontSize="small">assignment</Icon>,
    route: "/authentication/sign-up",
    component: <SignUp />,
    hide: true,
  },
  {
    type: "collapse",
    name: "Token Handler",
    key: "token-handler",
    icon: <Icon fontSize="small">vpn_key</Icon>,
    route: "/token",
    component: <TokenHandler/>,
    hide: true,
  },
];

export default routes;
