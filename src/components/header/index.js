import styles from './header.module.scss'
import React from "react";
import {Button, Popover} from "@blueprintjs/core";

export const Header = ({actions}) => {

    return (
            <header className={styles.header}>
                {
                    actions.length > 0 &&
                    actions.map((actionBtn, i) => {
                        return <Popover content={actionBtn.action} position={"bottom"} minimal>
                            <Button text={actionBtn.name} minimal />
                        </Popover>
                    })
                }
            </header>
    );
};