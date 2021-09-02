import React from "react";
import {SpriteSheet} from "react-spritesheet";
import CommonIcons from './../../assets/images/CommonIcons.gif';
import DocIcons from './../../assets/images/DocIcons.gif';
import FormIcons from './../../assets/images/FormIcons.png';
import GridIcons from './../../assets/images/GridIcons.gif';
import ModuleIcons from './../../assets/images/ModuleIcons.png';
import PortalIcons from './../../assets/images/PortalIcons.png';
import WorkIcons from './../../assets/images/WorkIcons.gif';
import CommonActEnabledIcons from './../../assets/images/CommonActEnabledIcons.png';
import PagingIcons from './../../assets/images/Paging.png';
import StateIcons from './../../assets/images/StateIcons.png';
import CaseMgtIcons from './../../assets/images/CaseMgt.png';
import RoundedIcons from './../../assets/images/spriteRoundedIconsSmall.gif';
import FolderIcons from './../../assets/images/FolderIcons.png';
import CommonIcons32 from './../../assets/images/CommonIcons32.png';
import errorIcon from "./../../assets/images/errorIcon.png";
import commonFormArrows from "./../../assets/images/commonFormArrows.png";
import envMgt from "./../../assets/images/EnvMgt.png";
import spriteIcons from "./../../assets/images/sprite_icons.png";
import dialogIcons from "./../../assets/images/Dialog.gif";
import {spriteSheet} from './spriteSheet';
import {ICON_CATEGORY} from "../../utils/iconNames";

export const Icons = (props) => {
    let iconList  = '';
    switch (props.icon?.iconCategory){
        case ICON_CATEGORY.COMMON_ICONS:
            iconList = CommonIcons;
            break;
        case ICON_CATEGORY.DOCUMENT_ICONS:
            iconList = DocIcons;
            break;
        case ICON_CATEGORY.FORM_ICONS:
            iconList = FormIcons;
            break;
        case ICON_CATEGORY.GRID_ICONS:
            iconList = GridIcons;
            break;
        case ICON_CATEGORY.MODULE_ICONS:
            iconList = ModuleIcons;
            break;
        case ICON_CATEGORY.PORTAL_ICON:
            iconList = PortalIcons;
            break;
        case ICON_CATEGORY.WORK_ICON:
            iconList = WorkIcons;
            break;
        case ICON_CATEGORY.ACT_ENABLED_ICONS:
            iconList = CommonActEnabledIcons;
            break;
        case ICON_CATEGORY.PAGING_ICONS:
            iconList = PagingIcons;
            break;
        case ICON_CATEGORY.STATE_ICONS:
            iconList = StateIcons;
            break;
        case ICON_CATEGORY.CASE_MANAGEMENT_ICONS:
            iconList = CaseMgtIcons;
            break;
        case ICON_CATEGORY.ROUNDED_ICONS:
            iconList = RoundedIcons;
            break;
        case ICON_CATEGORY.FOLDER_ICONS:
            iconList = FolderIcons;
            break;
        case ICON_CATEGORY.COMMON_ICONS_32:
            iconList = CommonIcons32;
            break;
        case ICON_CATEGORY.COMMON_FORM_ARROWS:
            iconList = commonFormArrows;
            break;
        case ICON_CATEGORY.ERROR_ICON:
            iconList = errorIcon;
            break;
        case ICON_CATEGORY.ENV_MGT:
            iconList = envMgt;
            break;
        case ICON_CATEGORY.SPRITE_ICONS:
            iconList = spriteIcons;
            break;
        case ICON_CATEGORY.DIALOG_ICONS:
            iconList = dialogIcons;
            break;
        default: {
            return CommonIcons;
        }
    }

    return <SpriteSheet
        filename={iconList}
        data={spriteSheet}
        sprite={props.icon?.name}
    />
};