import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';


export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
    const isAbsolute = /^https?:\/\//i.test(req.url);
    const url = isAbsolute ? req.url : `${environment.apiBaseUrl}${req.url.startsWith('/') ? '' : '/'}${req.url}`;
    return next(req.clone({ url }));
};