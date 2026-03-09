package com.taskio.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateBoardRequest {

    @NotBlank(message = "Pano adı boş bırakılamaz")
    private String name;

    private String description;

    private String color; // hex renk kodu, ör: "#6C3CE1"
}
