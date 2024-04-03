class ExecutionInfo {
  
}

function debug(context, execute) {
  const log = context.log = [];
  Object.defineProperty(context, "$log", {
    value: function $log(...args) {
      log.push(args);
    },
  });
  
  try {
    const { package: pkg, file, event, function: fn } = context;
    const label = [pkg, file, event, fn].filter(Boolean).join(" : ");
    console.group(label);
    
    if (typeof execute === "function") {
      context.phase = "start";
      console.debug("start", context);
      
      context.returnValue = execute(context);
      
      context.phase = "end";
      console.debug("end", context);
    } else {
      console.debug(context);
    }
    
    console.groupEnd(label);
    return context.returnValue;
  } catch (error) {
    context.error = error;
    console.error(context);
    console.groupEnd(label);
    throw error;
  }
}

export {
  debug,
};
