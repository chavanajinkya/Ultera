import React from "react";
import {Elevation} from "@blueprintjs/core";
import styles from './contentPanel.module.scss'

export const ContentPanel = ({headerIcon, headerTitle, actions, body,footer}) => {


    return (
        <div className={styles.contentPanel} elevation={Elevation.ZERO}>
            <div className={styles.header}>
                <div style={{display: "flex"}}>
                    <h4 className={styles.headerIcon}>{headerIcon}</h4>
                    <h4 className={styles.headerContent}>{headerTitle}</h4>
                </div>
                {actions}
            </div>
            <div className={styles.body}>
                {body}
            </div>
            {footer && <div className={styles.footer}>
                {footer}
            </div>}
        </div>
    );
};