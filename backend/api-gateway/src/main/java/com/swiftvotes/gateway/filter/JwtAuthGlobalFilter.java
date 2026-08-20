package com.swiftvotes.gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class JwtAuthGlobalFilter implements GlobalFilter, Ordered {

    private static final String AUTH_PATH_PREFIX = "/api/auth/";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtValidator jwtValidator;
    private final GatewayErrorResponseWriter errorResponseWriter;

    public JwtAuthGlobalFilter(JwtValidator jwtValidator, GatewayErrorResponseWriter errorResponseWriter) {
        this.jwtValidator = jwtValidator;
        this.errorResponseWriter = errorResponseWriter;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        if (!requiresAuth(request)) {
            return chain.filter(exchange);
        }

        String authHeader = request.getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            return errorResponseWriter.writeError(exchange, HttpStatus.UNAUTHORIZED,
                    "Missing or malformed Authorization header");
        }

        String token = authHeader.substring(BEARER_PREFIX.length());
        TokenClaims claims;
        try {
            claims = jwtValidator.verify(token);
        } catch (InvalidTokenException e) {
            return errorResponseWriter.writeError(exchange, HttpStatus.UNAUTHORIZED, e.getMessage());
        }

        ServerHttpRequest mutatedRequest = request.mutate()
                .header("X-User-Id", claims.userId())
                .header("X-User-Email", claims.email())
                .header("X-User-Role", claims.role())
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private boolean requiresAuth(ServerHttpRequest request) {
        boolean isGet = HttpMethod.GET.equals(request.getMethod());
        String path = request.getURI().getPath();
        boolean isAuthPath = path.startsWith(AUTH_PATH_PREFIX);
        return !isGet && !isAuthPath;
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
