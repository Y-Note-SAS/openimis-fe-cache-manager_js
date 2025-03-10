import React, { Component } from "react";
import { ConstantBasedPicker } from "@openimis/fe-core";

import { CACHE_MODEL } from "../constants";

class CacheModelPicker extends Component {
  render() {
    return <ConstantBasedPicker module="cache" label="model" constants={CACHE_MODEL} {...this.props} />;
  }
}

export default CacheModelPicker;