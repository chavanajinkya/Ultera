import React, {useEffect, useState} from "react";
import {Table} from "./Table";
import styles from "./table.module.scss";
import {ICONS} from "../../utils/iconNames";
import {Icons} from "../icons";
import {Button, Popover} from "@blueprintjs/core";
import {useTranslation} from "react-i18next";
import {useSelector} from "react-redux";

export const ValidationAssistant=(props)=>{
    const {t} = useTranslation();

    const  {setOpenValidationAssistant, searchCriteriaValidationData, actionsOnTableRowClick, onContinueClick, onColumnSort,isFullWidth=false,isContinueDisabled=false}=props;
    const {activeSubTabIndex} = useSelector((state) => state.dashboard);
    const [showInfoTooltip, setShowInfoTooltip ]=useState(false);
    const [selectedRow, setSelectedRow ]=useState([]);
    const [rowNav, setRowNav ]=useState({});
    const [currentIndex, setCurrentIndex ]=useState({index:0});
    const [validationAssistantCol, setValidationAssistantCol]= useState([
        {name:'pane', caption:t('CONTAINER_COL_LABEL'), colWidth:70},
        {name:'property', caption:t('PROPERTY_COL_LABEL'), colWidth:100},
        {name:'message', caption:t('MSG_COL_LABEL'), colWidth:200}
    ]);

    let templateButtonActions=[]
     templateButtonActions.push(<Button minimal icon={<Icons icon={ICONS.PREVIOUS} />}  onClick={()=>handlePrevClick()} disabled={currentIndex.index <= 0} title={t('PREVIOUS_LABEL')} text={t('PREVIOUS_LABEL')} className={styles.buttonIcon}/>);
    templateButtonActions.push(<Button minimal icon={<Icons icon={ICONS.NEXT} />} onClick={()=>handleNextClick()} disabled={currentIndex.index===searchCriteriaValidationData.length-1||selectedRow.length <= 0}  title={t('NEXT_LABEL')} text={t('NEXT_LABEL')} className={styles.buttonIcon}/>);
    templateButtonActions.push(<Button minimal icon={<Icons icon={ICONS.SUCCESS} />} onClick={()=>onContinueClick()} disabled={isContinueDisabled} title={t('CONTINUE_LABEL')} text={t('CONTINUE_LABEL')}className={styles.buttonIcon}/>);
    templateButtonActions.push(<Popover boundary={'viewport'} position={'bottom'} content={
        <div className={styles.infoToolTipContainer} style={{width:'500px'}}>
            <div className={styles.validationPanelHeader}><h4 className={styles.validationPanelHeaderText}>{t('ASSISTANT_INFO_HEADING')}</h4></div>
            <div style={{padding:'7px'}}>
                <div className={styles.validationPanelInfo}>
                    <div>{t('ASSISTANT_INSTRUCT')}</div>
                    <div className={styles.validationPanelErrorIcon}> {t('ASSISTANT_INSTRUCT_INVALID')}<div className={styles.errorIcon} style={{width:'10px', marginLeft:'5px'}}/></div>
                </div>
            </div>
        </div>
    } placement="bottom"><Button minimal icon={<Icons icon={ICONS.INFO} style={{paddingTop:'5px'}} />} title={t('INFO_LABEL')} text={t('INFO_LABEL')} className={styles.buttonIcon} rightIcon={<Icons icon={ICONS.ARROWS_DOWN_DARK} />} onClick={()=>setShowInfoTooltip(!showInfoTooltip)}/></Popover>);

    const  handleNextClick=()=>{
        setRowNav({key:'Next',value:Math.floor(Math.random() * 10)});
    }
    const  handlePrevClick=()=>{
        setRowNav({key:'Prev',value:Math.floor(Math.random() * 10)});
    }

    useEffect(()=>{
        setValidationAssistantCol([
                {name:'pane', caption:t('CONTAINER_COL_LABEL'), colWidth:70},
                {name:'property', caption:t('PROPERTY_COL_LABEL'), colWidth:100},
                {name:'message', caption:t('MSG_COL_LABEL'), colWidth:200}
            ]);
    },[activeSubTabIndex]);

    const onValidationSelection=(data, i)=>{
        setCurrentIndex({index: i})
        actionsOnTableRowClick(data);
        if(Array.isArray(data.data)){
            setSelectedRow(data.data);
        }else {
            setSelectedRow([data]);
        }
    }

    return <div>
        <div className={styles.header} style={{maxHeight:'30px'}}>
            <div className={styles.headerContainerStyle}>
                <h4 className={styles.headerIcon}><Icons icon={ICONS.STATE_FAILED} /></h4>
                <h4 className={styles.headerContent}>{t('ASSISTANT_TITLE')}</h4>
            </div>
           <div className={styles.validationPanelButtons}>
               <div className={styles.validationPanelTemplateBtn}>{templateButtonActions}</div>
               <Button minimal icon={<Icons icon={ICONS.ERROR} />} title={t('CLOSE_LABEL')} className={styles.buttonIcon} style={{width:'20px'}} onClick={()=>{setOpenValidationAssistant(false)}}/>
           </div>
        </div>
        <Table searchResultCol={validationAssistantCol}
               tableData={searchCriteriaValidationData}
               isHideNoSearchResultMsg={true}
               actionsOnTableRowClick={onValidationSelection}
               rowNav={rowNav}
               currentSelectedRow={setCurrentIndex}
               tableName={t('ASSISTANT_TITLE')}
               tableId={t('ASSISTANT_TITLE')}
               isSortable={true}
               setTableColumnsWidth={setValidationAssistantCol}
               onColumnSort={onColumnSort}
               isFullWidth={isFullWidth}
        />
    </div>
}