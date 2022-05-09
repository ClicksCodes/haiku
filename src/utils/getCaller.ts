export default () => {
    const err = new Error();
    return err.stack.split('\n')[3].match(/at (?:file:)?(.*)/)[1];
};