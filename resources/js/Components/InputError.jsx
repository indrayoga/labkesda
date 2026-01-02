import { HelperText } from "flowbite-react";

export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <HelperText
            {...props}
            className={'text-sm text-red-600 dark:text-red-400 ' + className}
        >
            {message}
        </HelperText>
    ) : null;
}
