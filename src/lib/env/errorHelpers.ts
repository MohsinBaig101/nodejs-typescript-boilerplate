export const getErrorMessage = (fieldName: string, message: string) => {
    return message.replace(/\[fieldName\]/g, fieldName);
};
