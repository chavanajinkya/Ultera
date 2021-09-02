import React from "react";
import {Button, ButtonGroup, Divider} from "@blueprintjs/core";
import {Icons} from "../icons";
import styles from "./headerActions.module.scss";
import {ICONS} from "../../utils/iconNames";

export const HeaderActions = ({actions, minimal,isHeader, commonActions, onActionClick}) => {

    const checkKey = (e,index) =>{
        if (e.keyCode == '37') {
            document.getElementById(index > 0 &&  index - 1)?.focus();
        } else if (e.keyCode == '39') {
            document.getElementById(index + 1)?.focus();
        }
    };

    return (
        <div>
            {isHeader?
                <div className={styles.mainWrapper}>
                    <ButtonGroup minimal={minimal}>
                        {
                            commonActions.length > 0 &&
                            commonActions.map((actionBtn, i) => {
                                return (actionBtn)
                            })
                        }
                    </ButtonGroup>
                    <div className={styles.mainWrapper}>
                        {
                            actions.length > 0 &&
                            actions.map((actionBtn, i) => {
                                return <Button id={i} icon={<Icons icon={actionBtn.icon}/>} title={actionBtn.btnName && actionBtn.btnName} text={actionBtn.btnName} minimal
                                onClick={()=> {onActionClick(i)}} onKeyDown={(e)=>{
                                    checkKey(e,i)
                                }}/>
                            })
                        }
                    </div>
            </div> :
            <ButtonGroup minimal={minimal}>
                {
                    actions.length > 0 &&
                    actions.map((actionBtn, index) => {
                        return(actionBtn)
                    })
                }
            </ButtonGroup>}
        </div>
    );
}