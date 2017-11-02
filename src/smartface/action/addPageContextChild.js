/**
 * Add context child action
 * 
 * @params {string} name - Context name of the root component
 * @params {Object} component - Specified component
 * @params {string} classnames - Component classnames
 * @params {Object} initialProps - Initial properties of the specified component
 * @returns {Object}
 */
export default function addPageContextChild(name, component, classNames="", initialProps={}){
    return {
        type: "addPageContextChild",
        name,
        component,
        classNames,
        initialProps
    };
}