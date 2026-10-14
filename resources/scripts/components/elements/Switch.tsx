import React, { useMemo } from 'react';
import styled from 'styled-components/macro';
import { v4 } from 'uuid';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import Input from '@/components/elements/Input';

const ToggleContainer = styled.div`
    ${tw`relative select-none leading-normal`};
    width: 44px;
    height: 24px;

    & > input[type='checkbox'] {
        ${tw`hidden`};

        &:checked + label {
            background: linear-gradient(135deg, #7c3aed 0%, #9333ea 100%);
            border-color: rgba(147, 51, 234, 0.5);
            box-shadow: 0 0 12px rgba(124, 58, 237, 0.35);
        }

        &:checked + label:before {
            transform: translateX(20px);
        }
    }

    & > label {
        ${tw`mb-0 block overflow-hidden cursor-pointer rounded-full`};
        width: 44px;
        height: 24px;
        background: #1c182c;
        border: 1px solid rgba(255, 255, 255, 0.1);
        transition: background 0.2s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.2s ease, box-shadow 0.2s ease;

        &::before {
            position: absolute;
            display: block;
            background: #ffffff;
            width: 20px;
            height: 20px;
            border-radius: 9999px;
            top: 2px;
            left: 2px;
            content: '';
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.45);
            transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), width 0.15s ease;
        }

        &:active::before {
            width: 24px;
        }
    }
`;

export interface SwitchProps {
    name: string;
    label?: string;
    description?: string;
    defaultChecked?: boolean;
    readOnly?: boolean;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    children?: React.ReactNode;
}

const Switch = ({ name, label, description, defaultChecked, readOnly, onChange, children }: SwitchProps) => {
    const uuid = useMemo(() => v4(), []);

    return (
        <div css={tw`flex items-center`}>
            <ToggleContainer css={tw`flex-none`}>
                {children || (
                    <Input
                        id={uuid}
                        name={name}
                        type={'checkbox'}
                        onChange={(e) => onChange && onChange(e)}
                        defaultChecked={defaultChecked}
                        disabled={readOnly}
                    />
                )}
                <Label htmlFor={uuid} />
            </ToggleContainer>
            {(label || description) && (
                <div css={tw`ml-3.5 w-full`}>
                    {label && (
                        <Label
                            css={[tw`cursor-pointer text-sm font-medium text-neutral-200`, !!description && tw`mb-0.5`]}
                            htmlFor={uuid}
                        >
                            {label}
                        </Label>
                    )}
                    {description && <p css={tw`text-neutral-400 text-xs`}>{description}</p>}
                </div>
            )}
        </div>
    );
};

export default Switch;
