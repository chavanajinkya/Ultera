import {Header, Icons, HeaderActions, ConfirmationDialog} from "../../../components";
import {
    ReflexContainer,
    ReflexSplitter,
    ReflexElement
} from 'react-reflex'
import styles from "./dashboard.module.scss";
import React, {useEffect, useState} from "react";
import {Route, Switch, useHistory, useLocation} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {setActiveTab, setActiveSubTab, setEnableSignOutPopup, setLoginState} from "../../../slices/dashboardSlice";
import {Button, Divider, Label, Menu, MenuItem} from "@blueprintjs/core";
import {ICONS} from "../../../utils/iconNames";
import {LeftPanel} from "../../app-ui/leftPanel";
import EnvironmentMgtComponent from "../environmentManagement";
import EnvironmentConfigComponent from "../environmentConfiguration";
import {Helmet} from "react-helmet";
import SignOut from "../../common/signOut";
import {useTranslation} from "react-i18next";
import {
    getActiveJobs,
    getAuditAndLicenseDetails,
    getExportJobsData,
    getJobHistory,
    getUserBatchJobs
} from "../../../api";
import LoginPopover from "../../common/loginPopover";
import {ImportPopoverComponent} from "../importPopover";
import {ExportPopoverComponent} from "../exportPopover";
import {PromotePopoverComponent} from "../promotePopover";
import {CreateEnvironmentPopover} from "../createEnvironment";
import {fetchDeleteEnvList, getExportEnvList} from "../../../api/adminSubHeaders";
import {DeleteEnvironment} from "../deleteEnvironment";
import AbortActiveJob from "../abortActiveJob";
import {LogActiveJobComponent} from "../logActiveJob";
import {getEnvConfigAdaptorsList, getEnvConfigEnvList} from "../../../api/environmentConfiguration";
import {onSortingConfigColumn} from "../../../slices/envConfigSlice";
import {ProceedActiveJob} from "../proceedActiveJob";
import UserBatchActiveJobs from "../userBatchActiveJobs";
import AuditAndLicenseComponent from "../auditAndLicense";
import ExportJobsComponent from "../auditAndLicense/exportJobs";
import {ImportLicenseFileComponent} from "../importLicenseFile";

export const Dashboard = ({title}) => {
    const {activeTabIndex, activeSubTabIndex, isLoggedIn, loading} = useSelector((state) => state.dashboard);
    const {enableSingleJobAction} = useSelector((state) => state.envManagement);
    const location = useLocation();
    const dispatch = useDispatch();
    const history = useHistory();
    const {t} = useTranslation();
    const [isError,setIsError]=useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [enableImportPopup, setEnableImportPopup] = useState(false);
    const [enableExportPopup, setEnableExportPopup] = useState(false);
    const [enablePromotePopup, setEnablePromotePopup] = useState(false);
    const [enableCreateEnvironment, setEnableCreateEnvironment] = useState(false);
    const [exportEnvList, setExportEnvList] = useState([]);
    const [enableDeleteEnvironment, setEnableDeleteEnvironment] = useState(false);
    const [deleteEnvList, setDeleteEnvList] = useState([]);
    const [enabledButtonArray, setEnabledButtonArray] = useState([]);
    const [resetEnvConfigState, setResetEnvConfigState] = useState(false);
    const [enableImportLicensePopup, setEnableImportLicensePopup] = useState(false);

    const adminTabData = [
        {title:t('toolseo.toolname.admin.envmgt'),icon:ICONS.ENV_SETTINGS, route: '/',
            rightButtons:[{icon:ICONS.ENV_IMPORT,btnName:t('toolseo.toolname.admin.import'), tooltip:t('toolseo.tooltip.admin.import')},
                {icon:ICONS.ENV_EXPORT,btnName:t('toolseo.toolname.admin.export'), tooltip:t('toolseo.tooltip.admin.export')},
                {icon:ICONS.ENV_PROMOTE,btnName:t('toolseo.toolname.admin.promote'), tooltip: t('toolseo.tooltip.admin.promote')},
                {icon:ICONS.ENV_CREATE,btnName:t('toolseo.toolname.admin.create'), tooltip:t('toolseo.tooltip.admin.create')},
                {icon:ICONS.ENV_DELETE,btnName:t('toolseo.toolname.admin.delete'), tooltip: t('toolseo.tooltip.admin.delete')}]},
    {title:t('toolseo.toolname.ipd.admin.envconfig.sidebar'),icon:ICONS.HOME, route: '/environments',rightButtons:[]},
    {title:t('sidebar_admin_userBatch'),icon:ICONS.JOB_STATUS, route: '/activeJobs',rightButtons:[]},
    {title:t('toolseo.toolname.ipd.admin.licensing'),icon:ICONS.ENV_AUDIT, route: '/audit-and-license',
        rightButtons:[{icon:ICONS.ENV_PROCEED_AUDIT,btnName:t('toolseo.toolname.licensing.import.license'),tooltip:t('toolseo.tooltipname.licensing.import.license')}]}
];

    const username = localStorage.getItem('username');
    useEffect(() => {
        if(!username) {
            history.push('/login')
        }
    }, []);

    useEffect(()=>{
        if (!isLoggedIn) {
            const userName=localStorage.getItem('username');
            if(userName) {
                setShowLoginPopup(true);
            }else {
                history.replace('/login')
            }
        }
    },[isLoggedIn]);

    useEffect(async () => {
        switch (location.pathname.toString()) {
            case '/environments':
                dispatch(setActiveTab(1));
                dispatch(setActiveSubTab(0));
                dispatch(onSortingConfigColumn({sortBy:'', orderBy: 'desc'}));
                try {
                    await getEnvConfigEnvList();
                }catch (error){
                    setIsError(true);
                    console.log('Error',error)
                }
                break;
            case '/componentAdaptors':
                dispatch(setActiveTab(1));
                dispatch(setActiveSubTab(1));
                dispatch(onSortingConfigColumn({sortBy:'', orderBy: 'desc'}));
                try {
                    await getEnvConfigAdaptorsList();
                }catch (error){
                    setIsError(true);
                    console.log('Error',error)
                }
                break;
            case '/activeJobs':
                dispatch(setActiveTab(2));
                try {
                    await getUserBatchJobs();
                }catch (error){
                    setIsError(true);
                    console.log('Error',error)
                }
                break;
            case '/audit-and-license':
               dispatch(setActiveTab(3));
               dispatch(setActiveSubTab(null));
               try{
                   await getAuditAndLicenseDetails();
               }catch (e) {
                   setIsError(true);
                   console.log('Error',e)
               }
                break;
            case '/exportJobs':
                dispatch(setActiveTab(3));
                dispatch(setActiveSubTab(0));
                try{
                    await getExportJobsData();
                }catch (e) {
                    setIsError(true);
                    console.log('Error',e)
                }
                break;
            case '/':
                dispatch(setActiveTab(0));
                try {
                    await getActiveJobs();
                }catch (error){
                    setIsError(true);
                    console.log('Error',error)
                }
                break;
            case '/jobHistory':
                dispatch(setActiveTab(0));
                dispatch(setActiveSubTab(1));
                await getJobHistory();
        }
    }, [location.pathname]);

    const onLoginPopupClose = async () =>{
        await dispatch(setLoginState(null));
        setShowLoginPopup(false);
    };

    const onSignOutClick = () => {
         dispatch(setEnableSignOutPopup({flag: true, title: title}))
    };

    const consoleMenu = <Menu className={styles.menu}>
        <MenuItem title={t('toolseo.tooltip.admin.signout')} className={styles.subMenu} icon={<Icons icon={ICONS.SIGN_OUT}/>} text={t('toolseo.toolname.admin.signout')}
                  onClick={onSignOutClick}/>
    </Menu>;

    const actionButton = [{"name": t('toolseo.toolname.admin.console'), "action": consoleMenu}];

    const headerActions = [];
    headerActions.push(<Button title={t('toolseo.tooltip.admin.signout')} icon={<Icons icon={ICONS.SIGN_OUT}/>} text={t('toolseo.toolname.admin.signout')} onClick={onSignOutClick}/>);
    headerActions.push(<Divider className={styles.divider}/>);

    const subData = {
        0: [
            {name: t('admin.envmgt.sidebar.activejobs'), route: '/'},
            {name: t('admin.envmgt.sidebar.historyjobs'), route: '/jobHistory'},
        ],
        1: [{name: t('admin.envconfig.envlist.title'), route: '/environments'},
            {name: t('admin.envconfig.component.adaptors.title'), route: '/componentAdaptors'}],
        2: [{name: t('admin.envmgt.sidebar.activejobs'), route: '/activeJobs'}],
        3: [{name: t('admin.license.sidebar.exportjobs'), route: '/exportJobs'}]
    };

    const onSubDataClick = async (index, route) => {
        if(route  !== '/audit-and-license') {
            dispatch(setActiveSubTab(index));
            const currentLocation = history.location.pathname;
            const newRoute = subData[activeTabIndex][index].route;
            setEnabledButtonArray([]);
            history.replace(newRoute);
            if (newRoute == currentLocation) {
                if (newRoute === "/") {
                    try {
                        await getActiveJobs();
                    } catch (error) {
                        setIsError(true);
                    }
                } else if (newRoute === '/jobHistory') {
                    await getJobHistory();
                } else if (newRoute === '/environments') {
                    await getEnvConfigEnvList();
                    setResetEnvConfigState(true)
                } else if (newRoute === '/componentAdaptors') {
                    await getEnvConfigAdaptorsList();
                    setResetEnvConfigState(!resetEnvConfigState)
                }
            }
        }else if(route === '/audit-and-license'){
            dispatch(setActiveSubTab(null));
            history.replace(route);
        }
    };
    const onActionClick = async (index) => {
            if (adminTabData[activeTabIndex].rightButtons[index].btnName === t('toolseo.toolname.admin.import')) {
                setEnableImportPopup(true);
            } else if (adminTabData[activeTabIndex].rightButtons[index].btnName === t('toolseo.toolname.admin.export')) {
                let envList = await getExportEnvList();
                if (envList.status === 200) {
                    setExportEnvList(envList?.data?.response?.choiceLists[0]?.selections);
                    setEnableExportPopup(true)
                }
            } else if (adminTabData[activeTabIndex].rightButtons[index].btnName === t('toolseo.toolname.admin.promote')) {
                setEnablePromotePopup(true)
            } else if (adminTabData[activeTabIndex].rightButtons[index].btnName === t('toolseo.toolname.admin.create')) {
                setEnableCreateEnvironment(true)
            } else if (adminTabData[activeTabIndex].rightButtons[index].btnName === t('toolseo.toolname.admin.delete')) {
                let envList = await fetchDeleteEnvList();
                if (envList.status === 200) {
                    setDeleteEnvList(envList?.data?.response?.choiceLists[0]?.selections);
                    setEnableDeleteEnvironment(true)
                }
            } else if(adminTabData[activeTabIndex].rightButtons[index].btnName === t('toolseo.toolname.licensing.import.license')){
                setEnableImportLicensePopup(true);
            }
    };

    const onImportPopupClose = () => {
        setEnableImportPopup(false);
    };
    const onExportPopupClose = () => {
        setEnableExportPopup(false)
    };
    const onPromotePopupClose = () => {
        setEnablePromotePopup(false)
    };
    const onCreateEnvClose = () => {
        setEnableCreateEnvironment(false)
    };
    const onDeleteEnvClose = () =>{
        setEnableDeleteEnvironment(false)
    };
    const onImportLicensePopupClose = () =>{
        setEnableImportLicensePopup(false);
    };

    return (
        <div className={styles.dashboard}>
            <Helmet>
                <title>Ultera: {t('admin.home.Title')}</title>
            </Helmet>
            <Header actions={actionButton}/>
            <div className={styles.header}>
                <HeaderActions minimal={true} actions={adminTabData[activeTabIndex].rightButtons} isHeader={true}
                               commonActions={headerActions} onActionClick={onActionClick}/>
            </div>
            {
                loading &&
                <ConfirmationDialog
                    showDialog={true}
                    divideByY={3}
                    icon={<div className={styles.loadingGifStyle}/>}
                    headerText={t('progress_popup_header')}
                    body={<Label>{`${t('message_pleaseWait')}`}</Label>}
                    transitionDuration={300}
                    isCloseButtonShown={false}/>
            }
            {
                showLoginPopup &&
                <LoginPopover showPopover={true} onClose={onLoginPopupClose} title={'UlteraAdmin'}/>
            }
            {
                enableImportPopup &&
                <ImportPopoverComponent showPopover={true} onClose={onImportPopupClose}/>
            }
            {
                enableExportPopup &&
                <ExportPopoverComponent showPopover={true} onClose={onExportPopupClose} exportEnvList={exportEnvList}/>
            }
            {
                enablePromotePopup &&
                    <PromotePopoverComponent showPopover={true} onClose={onPromotePopupClose}/>
            }
            {
                enableCreateEnvironment &&
                    <CreateEnvironmentPopover showPopover={true} onClose={onCreateEnvClose}/>
            }
            {
                enableDeleteEnvironment &&
                    <DeleteEnvironment showPopover={true} onClose={onDeleteEnvClose} EnvList={deleteEnvList}/>
            }
            {
                enableImportLicensePopup &&
                <ImportLicenseFileComponent showPopover={true} onClose={onImportLicensePopupClose}/>
            }
            <ReflexContainer orientation="horizontal">
                <ReflexElement maxSize={1} minSize={0}>
                </ReflexElement>
                <ReflexSplitter className="horizontal-splitter disabled"/>
                <ReflexElement>
                    <ReflexContainer orientation="vertical">
                        <ReflexElement flex={0.2} minSize={150} size={210}>
                            <LeftPanel data={adminTabData} subData={subData[activeTabIndex] ? subData[activeTabIndex] : []} onSubDataClick={onSubDataClick}/>
                        </ReflexElement>
                        <ReflexSplitter className="vertical-splitter">
                            <div className="vertical-splitter-thumb"/>
                        </ReflexSplitter>
                        <ReflexElement>
                            <Switch>
                                <Route path={'/environments'}>
                                    <EnvironmentConfigComponent resetEnvConfigState={resetEnvConfigState} setResetEnvConfigState={setResetEnvConfigState}
                                                                setEnabledButtonArray={setEnabledButtonArray}/>
                                </Route>
                                <Route path={'/componentAdaptors'}>
                                    <EnvironmentConfigComponent resetEnvConfigState={resetEnvConfigState} setResetEnvConfigState={setResetEnvConfigState}
                                                                setEnabledButtonArray={setEnabledButtonArray}/>
                                </Route>
                                <Route path={'/activeJobs'}>
                                    <UserBatchActiveJobs isError={isError}/>
                                </Route>
                                <Route path={'/audit-and-license'}>
                                    <AuditAndLicenseComponent/>
                                </Route>
                                <Route path={'/exportJobs'}>
                                    <ExportJobsComponent isError={isError} enabledButtonArray={enabledButtonArray}/>
                                </Route>
                                <Route path="/">
                                    <EnvironmentMgtComponent isError={isError} setEnabledButtonArray={setEnabledButtonArray} enabledButtonArray={enabledButtonArray}/>
                                </Route>
                            </Switch>
                        </ReflexElement>
                    </ReflexContainer>
                </ReflexElement>
            </ReflexContainer>
            <SignOut/>
            <AbortActiveJob setEnabledButtonArray={setEnabledButtonArray}/>
            { enableSingleJobAction.name === 'log' &&
                <LogActiveJobComponent setEnabledButtonArray={setEnabledButtonArray}/>
            }
            { enableSingleJobAction.name === 'proceed' &&
                <ProceedActiveJob setEnabledButtonArray={setEnabledButtonArray}/>
            }
        </div>
    );
};
