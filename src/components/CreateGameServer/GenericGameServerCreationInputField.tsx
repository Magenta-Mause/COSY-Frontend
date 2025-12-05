import {
    GameServerCreationContext,
    type GameServerCreationProps,
} from "@components/CreateGameServer/CreateGameServerModal.tsx";
import {GameServerCreationPageContext} from "@components/CreateGameServer/GenericGameServerCreationPage.tsx";
import {FieldError} from "@components/ui/field";
import {Input} from "@components/ui/input.tsx";
import {useCallback, useContext, useEffect, useRef, useState} from "react";
import type {ZodType} from "zod";

const GenericGameServerCreationInputField = (props: {
    attribute: keyof GameServerCreationProps;
    validator: ZodType;
    placeholder: string;
    label: string;
    errorLabel?: string;
}) => {
    const {setGameServerState} = useContext(GameServerCreationContext);
    const {setAttributeTouched, setAttributeValid} = useContext(GameServerCreationPageContext);
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
        setAttributeTouched(props.attribute, false);
        console.log("R")
    }, [props.attribute, setAttributeTouched]);

    const changeCallback = useCallback((value: string) => {
        const parsed = props.validator.safeParse(value).success;
        setIsValid(parsed);

        setGameServerState(props.attribute)(value);
        setAttributeValid(props.attribute, parsed);
        setAttributeTouched(props.attribute, true);
    }, [props.attribute, props.validator.safeParse, setAttributeTouched, setAttributeValid, setGameServerState]);

    return (
        <>
            <label htmlFor={props.attribute}>{props.label}</label>
            <Input
                placeholder={props.placeholder}
                onChange={(e) => changeCallback(e.target.value)}
                id={props.attribute}
            />
            {props.errorLabel && !isValid && <FieldError errors={[{message: props.errorLabel}]}/>}
        </>
    );
};

export default GenericGameServerCreationInputField;
