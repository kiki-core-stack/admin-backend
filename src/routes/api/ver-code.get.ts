import { create } from 'svg-captcha';

export const routeHandlerOptions = defineRouteHandlerOptions({ properties: { noLoginRequired: true } });

export default defaultHonoFactory.createHandlers(async (ctx) => {
    const captcha = create({ background: 'transparent', noise: Math.floor(Math.random() * 3) + 2 });
    ctx.session.verCode = captcha.text;
    ctx.header('content-type', 'image/svg+xml');
    return ctx.body(captcha.data);
});
