package com.fatec.escalaSimplex.exception;

import com.fatec.escalaSimplex.dto.response.ErroResponse;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalArgumentException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErroResponse handleIllegalArgumentException(IllegalArgumentException exception) {
        return new ErroResponse(
                "PROBLEMA_INVALIDO",
                exception.getMessage()
        );
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ErroResponse handleValidationException(MethodArgumentNotValidException exception) {
        String mensagem = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .findFirst()
                .map(erro -> erro.getDefaultMessage())
                .orElse("Requisição inválida.");

        return new ErroResponse(
                "REQUISICAO_INVALIDA",
                mensagem
        );
    }

    @ExceptionHandler(EntityNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public ErroResponse handleEntityNotFoundException(EntityNotFoundException exception) {
        return new ErroResponse(
                "RECURSO_NAO_ENCONTRADO",
                exception.getMessage()
        );
    }

    @ExceptionHandler(IllegalStateException.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErroResponse handleIllegalStateException(IllegalStateException exception) {
        return new ErroResponse(
                "ERRO_SOLVER",
                exception.getMessage()
        );
    }
}
