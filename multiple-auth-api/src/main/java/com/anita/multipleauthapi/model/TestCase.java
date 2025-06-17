package com.anita.multipleauthapi.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TestCase {
    /**
     * Input values for the test case
     * Can be a list of various types (String, Integer, etc.)
     */
    private List<Object> input;
    
    /**
     * Expected output for the test case
     */
    private String output;
    
    /**
     * Convert input list to string format suitable for program input
     * Each input value is placed on a separate line
     */
    public String getInputAsString() {
        if (input == null || input.isEmpty()) {
            return "";
        }
        
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < input.size(); i++) {
            sb.append(input.get(i).toString());
            if (i < input.size() - 1) {
                sb.append("\n");
            }
        }
        return sb.toString();
    }
} 