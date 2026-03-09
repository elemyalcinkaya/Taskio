package com.taskio.dto.request;

import lombok.Data;

@Data
public class UpdateBoardRequest {

    private String name; // Opsiyonel — sadece değişen gönderilir
    private String description;
    private String color;
}
