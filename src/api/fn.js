// URLSearchParams

const defaultAPIFn = {
  plural: {
    urlParam: (xhttp, method, urlFn) => id => xhttp[method](urlFn(id)),
    urlQuery: (xhttp, method, urlFn) => params =>
      xhttp[method](urlFn(), { params }),
    bodyData: (xhttp, method, urlFn) => payload =>
      xhttp[method](urlFn(), payload),
    targetData: (xhttp, method, urlFn) => (id, data) =>
      xhttp[method](urlFn(id), data)
  },
  singular: {
    common: (xhttp, method, url) => payload => xhttp[method](url, payload),
    blank: (xhttp, method, url) => () => xhttp[method](url)
  }
};

const pluralAPIConf = function(name) {
  const urlFn = () => `/${name}`;
  const urlFnDetail = id => `/${name}/${id}`;
  return {
    list: {
      urlFn,
      method: "GET",
      apiFn: defaultAPIFn.plural.urlQuery
    },
    create: {
      urlFn,
      method: "POST",
      apiFn: defaultAPIFn.plural.bodyData
    },
    retrieve: {
      urlFn: urlFnDetail,
      method: "GET",
      apiFn: defaultAPIFn.plural.urlParam
    },
    update: {
      urlFn: urlFnDetail,
      method: "PUT",
      apiFn: defaultAPIFn.plural.targetData
    },
    patch: {
      urlFn: urlFnDetail,
      method: "PATCH",
      apiFn: defaultAPIFn.plural.targetData
    },
    delete: {
      urlFn: urlFnDetail,
      method: "DELETE",
      apiFn: defaultAPIFn.plural.urlParam
    }
  };
};

const singularAPIConf = function(name) {
  const url = `/${name}`;
  return {
    create: {
      url,
      method: "POST",
      apiFn: defaultAPIFn.singular.common
    },
    retrieve: {
      url,
      method: "GET",
      apiFn: defaultAPIFn.singular.common // defaultAPIFn.singular.blank
    },
    update: {
      url,
      method: "PUT",
      apiFn: defaultAPIFn.singular.common
    },
    patch: {
      url,
      method: "PATCH",
      apiFn: defaultAPIFn.singular.common
    }
  };
};

const applyConf = (xhttp, urlConf) =>
  Object.entries(urlConf).reduce((result, [key, conf]) => {
    const { method, url, urlFn, apiFn } = conf;
    const urlParam = url || urlFn;
    if (!method || !urlParam) {
      return result;
    }
    if (typeof apiFn !== "function") {
      return result;
    }
    result[key] = apiFn(xhttp, method.toLowerCase(), urlParam);
    return result;
  }, {});

const TypeApiFactory = typeAPIConf =>
  function(xhttp, configChainFn) {
    if (typeof configChainFn !== "function") {
      configChainFn = o => o;
    }
    return function(name) {
      const urlConf = typeAPIConf(name);
      configChainFn(urlConf);
      return applyConf(xhttp, urlConf);
    };
  };

export const pluralAPI = TypeApiFactory(pluralAPIConf);

export const singularAPI = TypeApiFactory(singularAPIConf);
