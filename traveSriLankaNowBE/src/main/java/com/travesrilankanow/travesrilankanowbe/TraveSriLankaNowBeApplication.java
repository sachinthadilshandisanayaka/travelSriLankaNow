package com.travesrilankanow.travesrilankanowbe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;

@SpringBootApplication
public class TraveSriLankaNowBeApplication {

    public static void main(String[] args) {
        loadDotEnv();
        SpringApplication.run(TraveSriLankaNowBeApplication.class, args);
    }

    /**
     * Loads key=value pairs from a .env file into System properties so Spring
     * can resolve ${VAR_NAME} placeholders. Only runs when the variable is NOT
     * already set in the real environment (Docker / CI env vars take priority).
     *
     * Looks for the file in: .env → ../.env → ../../.env
     */
    private static void loadDotEnv() {
        File envFile = findEnvFile();
        if (envFile == null) return;

        System.out.printf("[dotenv] Loading %s%n", envFile.getAbsolutePath());

        try (BufferedReader reader = new BufferedReader(new FileReader(envFile))) {
            String line;
            while ((line = reader.readLine()) != null) {
                line = line.trim();
                if (line.isEmpty() || line.startsWith("#")) continue;

                int eq = line.indexOf('=');
                if (eq < 1) continue;

                String key   = line.substring(0, eq).trim();
                String value = line.substring(eq + 1).trim();

                // Strip surrounding quotes if present  ("value" or 'value')
                if (value.length() >= 2
                        && ((value.startsWith("\"") && value.endsWith("\""))
                         || (value.startsWith("'")  && value.endsWith("'")))) {
                    value = value.substring(1, value.length() - 1);
                }

                // Real environment variables always win over .env file
                if (System.getenv(key) == null && System.getProperty(key) == null) {
                    System.setProperty(key, value);
                }
            }
        } catch (IOException e) {
            System.err.printf("[dotenv] Could not read %s: %s%n", envFile.getPath(), e.getMessage());
        }
    }

    private static File findEnvFile() {
        for (String path : new String[]{".env", "../.env", "../../.env"}) {
            File f = new File(path);
            if (f.exists() && f.isFile()) return f;
        }
        return null;
    }
}
