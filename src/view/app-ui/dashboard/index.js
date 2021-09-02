import {ConfirmationDialog, Header, HeaderActions, Icons} from "../../../components";
import {
    ReflexContainer,
    ReflexSplitter,
    ReflexElement
} from 'react-reflex'
import WorkSearchComponent from "../workSearch";
import styles from "./dashboard.module.scss";
import React, {useEffect, useState} from "react";
import {LeftPanel} from "../leftPanel";
import {SystemManager} from "../SystemManager";
import {Route, Switch, useLocation} from "react-router";
import {useDispatch, useSelector} from "react-redux";
import {
    setActiveTab,
    setLoginState,
    setError,
    setEnableSignOutPopup,
    setOpenEnvDialog,
    setEnvironmentId,
    setActiveSubTab,
    setResultSetData, setLeftPanelSubData
} from "../../../slices/dashboardSlice";
import {Button, Divider, Label, Menu, MenuItem, Popover} from "@blueprintjs/core";
import LoginPopover from "../../common/loginPopover";
import {ICONS} from "../../../utils/iconNames";
import {useTranslation} from "react-i18next";
import {useHistory} from "react-router-dom";
import {Helmet} from "react-helmet";
import SignOut from "../../common/signOut";
import {getLeftPanelData} from "../../../api";
import {EnvironmentDialog} from "../Environment";
import CaseSearchComponent from "../caseSearch";
import ContentSearchComponent from "../contentSearch";
import HistorySearchComponent from "../historySearch";
import {MassRouteReassignDialog} from "../JobStatus/MassRouteReassign";
import {Select} from "@blueprintjs/select";

export const Dashboard = ({title}) => {
    const { activeTabIndex, isLoggedIn, errorText, enableSignOutPopup,leftPanelSubData,openEnvDialog, environmentId, environmentList}  = useSelector((state) => state.dashboard)
    const location = useLocation();
    const dispatch = useDispatch();
    const history = useHistory();
    const [showDialog, setShowDialog] = useState(false);
    const [showLoginPopup, setShowLoginPopup] = useState(false);
    const [showRouteReassignPopup, setShowRouteReassignPopup] = useState(false);
    const {t} = useTranslation();
    const username = localStorage.getItem('username');
    const storedEnvId = localStorage.getItem('envId');
    const leftPanelSize = Number(localStorage.getItem('__default_home_left')) || 250;
    const leftPanelFlexValue = leftPanelSize / window.innerWidth;
    const tabData =[
    {title:t('toolseo.toolname.ipd.portal.tool'),icon:ICONS.MODULE_MY_ULTERA, route: '',rightButtons:[
            {icon:ICONS.PORTAL_RENAME,btnName:t('toolseo.toolname.ipd.search.rename')},
            {icon:ICONS.PORTAL_ORDER,btnName:t('toolseo.toolname.ipd.search.order')},
            {icon:ICONS.PORTAL_DELETE,btnName:t('toolseo.toolname.ipd.search.delete')},
            {icon:ICONS.PORTAL_ADD_WIDGET,btnName:t('toolseo.toolname.ipd.search.addWidget')},]},
    {title:t('sysmgr.worksearch.config.general.title'),icon:ICONS.MODULE_WORK_SEARCH, route: 'work-search',rightButtons:[
            {icon:ICONS.WORK_FILE,btnName:t('toolseo.toolname.myWorkCreateWork')},
            {icon:ICONS.PORTAL_SAVE ,btnName:t('toolseo.toolname.ipd.search.saveas')}]},
    {title:t('sysmgr.broker.casesearch.context.title'),icon:ICONS.CASE_DIRECTORY_SEARCH, route: 'case-search',rightButtons:[
            {icon:ICONS.CASE_CREATE_DIRECTORY,btnName:t('toolseo.toolname.ipd.cases.tool.new')},
            {icon:ICONS.PORTAL_SAVE,btnName:t('toolseo.toolname.ipd.search.saveas')}]},
    {title:t('sysmgr.fields.templateName.caption'),icon:ICONS.DOC_CONTENT_SEARCH, route: 'content-search',rightButtons:[
            {icon:ICONS.DOC_ORDER,btnName:t('content.addcontent.title')},
            {icon:ICONS.PORTAL_SAVE,btnName:t('toolseo.toolname.ipd.search.saveas')}]},
    {title:t('toolseo.tooltipname.ipd.history.tool.search'),icon:ICONS.MODULE_HISTORY_SEARCH, route: 'history-search',rightButtons:[
            {icon:ICONS.PORTAL_SAVE,btnName:t('toolseo.toolname.ipd.search.saveas')}]},
    {title:t('contextseo.description.contextSysMgr'),icon:ICONS.MODULE_PREFERENCES,route: 'system-manager',rightButtons:[
            {icon:ICONS.DESCENDING,btnName:t('sysgmr.translation.export.dialog.title')},
            {icon:ICONS.ASCENDING,btnName:t('sysgmr.translation.import.dialog.title')},
            {icon:ICONS.HELP,btnName:t('toolseo.toolname.sysMgrHelp')}]}
    ]
    useEffect(() => {
        if(storedEnvId){
            dispatch(setEnvironmentId(storedEnvId))
        }
        if (!username) {
            history.push('/login')
        }
    }, []);

    useEffect(() => {
        if(environmentList?.length > 1) {
            if (!localStorage.getItem('envId')) {
                dispatch(setOpenEnvDialog(true))
            } else {
                //call left panel API's
            }
        }
    }, [environmentId]);

    const onSelectClick = () => {
        //TODO- Show loading while call env API
        dispatch(setOpenEnvDialog(true))
    };

    const onSignOutClick = () => {
        dispatch(setEnableSignOutPopup({flag: true, title: title}))
    };

    const handleDialog = () => {
        setShowDialog(false);
    };

    const EnvMenu = (
        <Menu className={styles.menu}>
            <MenuItem title={t('toolseo.toolname.admin.signout')} className={styles.subMenu} icon={<Icons icon={ICONS.SIGN_OUT}/>} text={t('toolseo.toolname.admin.signout')}
                      onClick={onSignOutClick}/>
            <MenuItem title={t('toolseo.tooltipname.tool3')} className={styles.subMenu} icon={<Icons icon={ICONS.HOME}/>} text={t('toolseo.toolname.tool3')}
                      onClick={onSelectClick}/>
        </Menu>);

    const HelpMenu = (
        <Menu className={styles.menu}>
            <MenuItem className={styles.subMenu} icon={<Icons icon={ICONS.HELP}/>} text={t('toolseo.toolname.HelpContents')}/>
        </Menu>);

    const actions = [{"name": t('toolseo.toolname.tool1'), "action": EnvMenu}, {"name": t('toolseo.toolname.toolHelpMenu'), "action"  : HelpMenu}];

    const logStatuses=[
        {id: 1, name: t('toolseo.toolname.ipd.system.printStatusTool'), icon:ICONS.PRINT, title:t('toolseo.tooltipname.ipd.system.printStatusTool')},
        {id: 2, name: t('toolseo.toolname.ipd.cases.reassignStatusTool'), icon:ICONS.CASE_OK, title:t('toolseo.tooltipname.ipd.cases.reassignStatusTool')},
        {id: 3, name: t('toolseo.toolname.ipd.process.routeStatusTool'), icon:ICONS.WORK_FORWARD, title:t('toolseo.tooltipname.ipd.process.routeStatusTool')},
    ];

    const headerActions = [];
    headerActions.push(<Button title={t('toolseo.toolname.admin.signout')} icon={<Icons icon={ICONS.SIGN_OUT} />} text={t('toolseo.toolname.admin.signout')} onClick={onSignOutClick}/>);
    headerActions.push(<Button  title={t('toolseo.tooltipname.ArrangeWindows')} icon={<Icons icon={ICONS.AUTO_ARRANGE} />} text={t('toolseo.toolname.ArrangeWindows')} />);
    headerActions.push(<Select
        items={logStatuses}
        itemRenderer={(item, {modifiers, handleClick}) => (
            <MenuItem
                style={{
                    height: '20px',
                    width: "210px",
                    border: "1px solid transparent",
                    minHeight: '24px',
                    outline: modifiers.active && "-webkit-focus-ring-color auto 1px"
                }}
                active={modifiers.active}
                onClick={handleClick}
                text={<div title={item.title} style={{display:'flex',flexDirection:'row'}}><Icons icon={item.icon}/><div style={{paddingLeft:'2px'}}>{item.name}</div></div>}
                key={item.name}
            />
        )}
        filterable={false}
        itemsEqual={'id'}
        onItemSelect={(d)=> {
            if(d.id===3){
                setShowRouteReassignPopup(!showRouteReassignPopup)
            }else {
                console.log('item selected', d)
            }
        }}
        popoverProps={{minimal: true}}>
        <Button title={t("toolseo.tooltipname.ipd.system.jobStatusTool")}
                icon={<Icons icon={ICONS.JOB_STATUS} />}
                text={t('toolseo.toolname.ipd.system.jobStatusTool')}
                rightIcon={<Icons icon={ICONS.FORM_DOWN_WHITE} />} />
    </Select>);

    headerActions.push(<Divider className={styles.divider} />);

    useEffect(() => {
        dispatch(setLeftPanelSubData([]));
        switch (location.pathname.toString()) {
            case '/':
                dispatch(setActiveTab(0));
                dispatch(setResultSetData(null));
                getLeftPanelData('portalContext','')
                break;
            case '/work-search':
                dispatch(setActiveTab(1));
                dispatch(setResultSetData(null));
                getLeftPanelData('mySearchEvent', 'worksearch', true)
                break;
            case '/case-search':
                dispatch(setActiveTab(2));
                dispatch(setResultSetData(null));
                getLeftPanelData('caseSearchContext','casesearch',true)
                break;
            case '/content-search':
                dispatch(setActiveTab(3));
                dispatch(setResultSetData(null));
                getLeftPanelData('contentSearchController','content',false)
                break;
            case '/history-search':
                dispatch(setActiveTab(4));
                dispatch(setResultSetData(null));
                getLeftPanelData('historySearchContext','history',false)
                break;
            case '/system-manager':
                dispatch(setActiveTab(5));
                break;
            default:
                dispatch(setActiveTab(0));
        }
    }, [location.pathname]);

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

    const onLoginPopupClose = async () =>{
      await dispatch(setLoginState(null));
      setShowLoginPopup(false);
    }

    const onSubDataClick = (index) => {
        dispatch(setResultSetData(null));
        dispatch(setActiveSubTab(index));
    };

    return (
        <>
            <Helmet>
                <title>Ultera: {t('ttl.homePage.Title')}</title>
            </Helmet>
            <div className={styles.dashboard}>
                <Header actions={actions}/>
                <div className={styles.header}>
                    <HeaderActions minimal={true} actions={tabData[activeTabIndex].rightButtons} isHeader={true} commonActions={headerActions}/>
                </div>
                {
                    showLoginPopup &&
                    <LoginPopover showPopover={true} onClose={onLoginPopupClose} title={'Ultera'}/>
                }
              <ConfirmationDialog
                  showDialog={errorText.message?.length ? true : false}
                  headerText={errorText?.title}
                  divideByX={4}
                  divideByY={6}
                  width={600}
                  icon={<Icons icon={ICONS.ERROR_OUTLINE}/>}
                  body={<div>{errorText?.message}</div>}
                  onClose={()=>dispatch(setError({}))}
                  noButtonText={t('btn.common.ok')}
                  onNoBtnClick={()=>dispatch(setError({}))}
                  isDismissOnEnterKey={true}
              />
                <ReflexContainer orientation="horizontal">
                    <ReflexElement maxSize={1} minSize={0}>
                    </ReflexElement>
                    <ReflexSplitter className="horizontal-splitter disabled"/>
                    <ReflexElement>
                        <ReflexContainer orientation="vertical">
                            <ReflexElement flex={leftPanelFlexValue} minSize={150}
                                           onResize={(e)=>{localStorage.setItem('__default_home_left',e.domElement.clientWidth)}} >
                                <LeftPanel data={tabData} subData={leftPanelSubData} onSubDataClick={onSubDataClick}/>
                            </ReflexElement>
                            <ReflexSplitter className="vertical-splitter">
                                <div className="vertical-splitter-thumb"/>
                            </ReflexSplitter>
                            <ReflexElement>
                                <Switch>
                                    <Route exact={"/"} path="/">
                                        <div className={styles.ulteraHome}>
                                            <Icons icon={ICONS.WHITE_ALERT_ICON}/>
                                            <h3 className={styles.configMsgTextStyle}>{t('ipd.widget.configuration.message')}</h3>
                                        </div>
                                    </Route>
                                    <Route path="/work-search">
                                        <WorkSearchComponent/>
                                    </Route>
                                    <Route path="/case-search">
                                        <CaseSearchComponent/>
                                    </Route>
                                    <Route path="/content-search">
                                        <ContentSearchComponent/>
                                    </Route>
                                    <Route path="/history-search">
                                        <HistorySearchComponent/>
                                    </Route>
                                    <Route path="/system-manager">
                                        <SystemManager/>
                                    </Route>
                                </Switch>
                            </ReflexElement>
                        </ReflexContainer>
                    </ReflexElement>
                </ReflexContainer>
            </div>
            <SignOut/>
            {
                openEnvDialog &&
                <EnvironmentDialog openEnvDialog={true} title={title}/>
            }
            {
                showRouteReassignPopup  &&
                    <MassRouteReassignDialog showRouteReassignPopup={showRouteReassignPopup} setShowRouteReassignPopup={setShowRouteReassignPopup}/>
            }
            <ConfirmationDialog
                showDialog={showDialog}
                icon={<div className={styles.loadingGifStyle}/>}
                headerText={t('progress_popup_header')}
                onClose={handleDialog}
                body={<Label>{t('message_pleaseWait')}</Label>}
                onNoBtnClick={handleDialog}
                transitionDuration={300}
                isCloseButtonShown={false}/>
        </>
    );
};
