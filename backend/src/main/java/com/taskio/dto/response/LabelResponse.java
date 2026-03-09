package com.taskio.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LabelResponse {

    private Long id;
    private String name; // "Design", "Dev", "Bug", "Content", "Testing", "Release"
    private String color; // Etiket rengi (hex)
}
