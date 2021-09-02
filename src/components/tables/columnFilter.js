import {Button, H5, Tooltip} from "@blueprintjs/core";
import styles from "./table.module.scss"
import {useTranslation} from "react-i18next";
import React from "react";
import {Position} from "@blueprintjs/core/lib/esnext/common/position";
import {Icons} from "../icons";
import {ICONS} from "../../utils/iconNames";

const ColumnComponent = ({
                             onFilterClick, columnName,showFilterButton,onOpenFilter, showFilterBtnOnColumn
                         }) => {
    const {t} = useTranslation();
    const filterIcon = <Icons icon={ICONS.SPRITE_FILTER_ICON}/>;

    const tooltipContent = () =>{
        return <div className={styles.tooltipDiv}>
            <h3 className={styles.filterBar}>{t('admin_filter_Bar')}</h3>
            <H5 className={styles.filterBarText} style={{marginLeft: showFilterBtnOnColumn === "environment" && -5}}>{`${t('admin_filter_bar_msg')} ${columnName}.`}</H5>
        </div>
    };

    return <div className={styles.filterStyle} style={{paddingLeft: showFilterBtnOnColumn === 'environment' && 5}}>
        {
            showFilterButton ?  <><Button icon={filterIcon} className={styles.filterDiv} onClick={onOpenFilter}
                                          title={showFilterBtnOnColumn === 'environment' ? t('admin_stats_define_filer') : t('admin_define_filter')}>
                    <h2 style={{margin:0}}>...</h2>
                </Button>
                <Tooltip usePortal={showFilterBtnOnColumn !== "environment"} content={tooltipContent()} position={Position.BOTTOM} style={{width:'100% !important'}} popoverClassName={styles.filterTooltipStyle}>
                    <h3 className={styles.filterText} onClick={onFilterClick}>{t('admin_component_adaptor_no_filter_msg')}</h3>
                </Tooltip></>
                :
                <div style={{height:16}}/>
        }
        <Tooltip usePortal={showFilterBtnOnColumn !== "environment"} content={tooltipContent()} position={Position.BOTTOM} style={{width:'100% !important'}} popoverClassName={styles.filterTooltipStyle}>
            <h3 className={styles.filterText} onClick={onFilterClick}>&nbsp;</h3>
        </Tooltip>
    </div>
};

export default ColumnComponent;