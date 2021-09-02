import React, {useEffect, useState} from 'react';
import styles from "./confirmationDialog.module.scss";
import {Button, Dialog} from "@blueprintjs/core";
import {Rnd} from "react-rnd";
import {useTranslation} from "react-i18next";

export const ConfirmationDialog = (props) => {
    const [applyDisablePointer, setApplyDisablePointer] = useState(false);
    const [documentFocusElement, setDocumentFocusElement] = useState();
    const {
        showDialog, onClose, icon, headerText, body, yesButtonText, onYesBtnClick, noButtonText,
        onNoBtnClick, transitionDuration, isCloseButtonShown, width = 300, zIndex, environmentError,
        yesButtonTooltip, noButtonTooltip, thirdButtonText, onThirdBtnClick, isPaginationPopup = false, divideByX=2, divideByY=4,height, isDismissOnEnterKey=false,isValueBuilderDialog=false,
        tableData=[]
    } = props;
    const {t} = useTranslation();

    useEffect(()=>{
        let start;
        if(headerText === t('admin_activeJob_abort_title') || headerText === `Ultera: ${t('com.ipd.admin.logviewer.pageTitle')}` ||
        headerText === "Confirmation"){
            start = document.getElementById(`yes`);
        }else {
            start = document.getElementById(`no`);
        }
        setDocumentFocusElement(start);
        start?.focus();

    },[]);

    useEffect(()=>{
        let start;
        if(headerText === t('admin_activeJob_abort_title') || headerText === `Ultera: ${t('com.ipd.admin.logviewer.pageTitle')}` ||
            headerText === "Confirmation"){
            start = document.getElementById(`yes`);
        }else {
            start = document.getElementById(`no`);
        }
        setDocumentFocusElement(start);
        start?.focus();

    },[tableData?.length]);

    const onDragging = (e) => {
        e.stopPropagation();
        setApplyDisablePointer(true)
    };
    const onDragStop = () => {
        setApplyDisablePointer(false)
    };

    return (
        <>
            { showDialog &&
                <div className={styles.overlay}></div>
            }
            <Rnd
                // onKeyDown={(e)=>{ if((e.keyCode===13 || e.keyCode === 32 || e.key === ' ')  && isDismissOnEnterKey)
                // {   headerText === t('admin_activeJob_abort_title') ? onYesBtnClick() :
                //     onNoBtnClick ? onNoBtnClick() :  onYesBtnClick && onYesBtnClick()}}}
                style={{
                    display: showDialog ? "flex" : "none",
                    alignItems: "center",
                    justifyContent: "center",
                    border: 0,
                    background: "#f0f0f0",
                    zIndex: zIndex ? zIndex : 999,
                    position: "fixed",
                    top: 0,
                    left: 0,
                }}
                default={{
                    x: (window.screen.width - width) / divideByX,
                    y: isPaginationPopup ? 10: window.screen.height / divideByY,
                    width: width,
                    height: height
                }}
                dragHandleClassName={"bp3-dialog-header"}
                onDragStart={onDragging}
                onDragStop={onDragStop}
                onKeyDown={(e)=> isValueBuilderDialog && e.ctrlKey && (e.key==='r'||e.key==='R') && e.preventDefault()}
            >
                <Dialog
                    autoFocus={true}
                    isOpen={showDialog}
                    canOutsideClickClose={false}
                    isCloseButtonShown={isCloseButtonShown}
                    icon={icon}
                    title={headerText}
                    style={{width}}
                    className={styles.dialog}
                    onClose={() => onClose()}
                    hasBackdrop={false}
                    usePortal={false}
                    transitionDuration={transitionDuration}
                >
                    {isCloseButtonShown &&
                    <div className={`bp3-button bp3-minimal bp3-dialog-close-button ${styles.closeBtn}`}
                         title={t('case.reassign.status.cancel')} onClick={()=>onClose()}/>
                    }
                    <div className={`${applyDisablePointer && 'disable-events'} ${styles.dialogContent}`}>
                        {body}
                    </div>
                    {noButtonText || yesButtonText || thirdButtonText ? <div className={styles.dialogFooter}>
                        <div className={styles.footerButtonContainer}>
                            {yesButtonText ? <div id={"yes"} tabIndex={0}
                                                  onKeyDown={(e) => {
                                                      if (e.key === "Enter" || e.keyCode === 32 || e.key === ' ') {
                                                          !environmentError && onYesBtnClick()
                                                      }
                                                  }} style={{marginRight: noButtonText ? 10 : 0}}><Button
                                title={yesButtonTooltip} className={styles.footerYesButton} text={yesButtonText}
                                onClick={() => onYesBtnClick()}
                                disabled={environmentError}/></div> : null}
                            {noButtonText ? <div id={"no"} tabIndex={0} onKeyDown={(e) => {
                                if (e.key === "Enter" || e.keyCode === 32 || e.key === ' ') {
                                    onNoBtnClick()
                                }
                            }} style={{marginRight: thirdButtonText ? 10 : 0}} ><Button title={noButtonTooltip} className={styles.footerButton} text={noButtonText}
                                       onClick={() => onNoBtnClick()}/></div> : null}
                            {
                                thirdButtonText ? <div id={"apply"} tabIndex={0} onKeyDown={(e) => {
                                    if (e.key === "Enter" || e.keyCode === 32 || e.key === ' ') {
                                        onNoBtnClick()
                                    }
                                }}><Button className={styles.footerButton} text={thirdButtonText}
                                           onClick={() => onThirdBtnClick()}/></div> : null
                            }
                        </div>
                    </div> : null}
                </Dialog>
            </Rnd>
        </>
    )
};